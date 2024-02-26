import { faker } from '@faker-js/faker'

// import { method } from 'cypress/types/bluebird' 

describe('Hacker Stories', () => {

  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the real API', () => {
    beforeEach(() => {

      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        
        query: {
          query: initialTerm,  
          page: '0'
  
        }
      }).as('searchReq')
      // cy.intercept('GET', '**/search?query=React&page=0').as('searchReq')
      
      cy.visit('/')
      
      cy.wait('@searchReq')
  
      // cy.assertLoadingIsShownAndHidden()
      // cy.contains('More').should('be.visible')
    })
  
    it('shows 20 stories, then the next 20 after clicking "More"', () => {

      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        
        query: {
          query: initialTerm,  
          page: '1'
  
        }
      }).as('searchNextReq')

      cy.get('.item').should('be.visible').should('have.length', 20)

      cy.contains('More').should('be.visible').click()
      
      cy.wait('@searchNextReq')
      // cy.assertLoadingIsShownAndHidden()

      cy.get('.item').should('be.visible').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
        
      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`,
        
      ).as('searchNextTerm')

      cy.get('#search')
        .should('be.visible')
        .clear()
        .type(`${newTerm}{enter}`)

      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@searchNextTerm')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        
        query: {
          query: initialTerm,  
          page: '0'
  
        }
      }).as('initialTerm')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()


      cy.wait('@initialTerm')
      // cy.assertLoadingIsShownAndHidden()
      cy.getLocalStorage('search')
        .should('be.equal', initialTerm)


      cy.get('.item').should('be.visible').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })

  })
  
  context('Mocking the API', () => {

    context('Footer and list of stories', () => {
      
      beforeEach(() => {

        cy.intercept(
          'Get',
          `**/search?query=${initialTerm}&page=0`,
          {fixture: 'stories'}
        ).as('searchReq')
        // cy.intercept('GET', '**/search?query=React&page=0').as('searchReq')
        
        cy.visit('/')
        
        cy.wait('@searchReq')
    
        // cy.assertLoadingIsShownAndHidden()
        // cy.contains('More').should('be.visible')
      })
    
      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })
    
      context('List of stories', () => {
        
        const stories = require('../fixtures/stories.json')
        it('shows the right data for all rendered stories', () => {

          cy.get('.item')
            .first()
            .should('be.visible')
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          // cy.get(`.item a:contains(${stories.hits[0].url})`)
          //   .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('be.visible')
            .should('contain', stories.hits[2].title)
            .and('contain', stories.hits[2].author)
            .and('contain', stories.hits[2].num_comments)
            .and('contain', stories.hits[2].points)
          // cy.get(`.item a:contains(${stories.hits[2].url})`)
          //   .should('have.attr', 'href', stories.hits[2].url)
        })
    
    
        it('shows one less story after dimissing the first story', () => {
        
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()
        
          // cy.wait('@searchReq')
          
          cy.get('.item').should('have.length', 2)
        })
        
        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)').as('titleHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[2].title)
            cy.get(`.item a:contains(${stories.hits[2].title})`)
              .should('have.attr', 'href', stories.hits[2].url)

          })
    
          it('orders by author', () => {

            cy.get('.list-header-button:contains(Author)').as('authorHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.get('@authorHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[2].author)
          })
    
          it('orders by comments', () => {

            cy.get('.list-header-button:contains(Comments)').as('commentsHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[2].num_comments)

            cy.get('@commentsHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)

          })
    
          it('orders by points', () => {

            cy.get('.list-header-button:contains(Points)').as('pointsHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[2].points)

            cy.get('@pointsHeader').click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)
        
          })
        })

        
        
      })
    })

    context('Search', () => {
  
      beforeEach(() => {
        
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          {fixture: 'emptyStories'}
        ).as('getEmptyStories')
  
        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`,
          {fixture: 'stories'}
        ).as('getStories')


        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .clear()
      })
  
      it('shows that no story is returned', () => {
        cy.get('.item').should('not.exist')
      })
      it('types and hits ENTER', () => {

        cy.get('#search')
          .should('be.visible')
          .type(`${newTerm}{enter}`)
  
        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')
  
        cy.getLocalStorage('search').should('be.equal', newTerm)

        cy.get('.item').should('be.visible').should('have.length', 3)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      it('types and clicks the submit button', () => {
        
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()
  
        cy.wait('@getStories')
        // cy.assertLoadingIsShownAndHidden()
  
        cy.get('.item').should('have.length', 3)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      // it('types and submits the form directly', () => {
  
      //   cy.get('form input[type="text"]')
      //     .should('be.visible')
      //     .clear()
      //     .type(newTerm)
      
      //   cy.get('form').submit()     
        
      //   cy.wait('@searchNextTerm')
  
      //   cy.get('.item').should('have.length', 20)
  
      // })
  
      context('Last searches', () => {
        
        it('shows a max of 5 buttons for the last searched terms', () => {
          // const faker = require('faker')
  
          cy.intercept(
            'GET',
            '**/search**',
            { fixture: 'emptyStories' } 
          ).as('searchMultipleTerms')
  
          Cypress._.times(6, () => {
            const randomWord = faker.random.word()
            cy.get('#search')
            .clear()
            .type(`${randomWord}{enter}`)

            
            cy.wait('@searchMultipleTerms')
            cy.getLocalStorage('search').should('be.equal', randomWord)
            // cy.wait('@getEmptyStories')
          })
  
          // cy.assertLoadingIsShownAndHidden()
  
          cy.get('.last-searches')
            .within(() => {
              cy.get('button')
                .should('be.visible')
                .should('have.length', 5)
            }
          )

        })
      })
    })
  
  })
  
  context('Errors', () => {

    it('shows "Something went wrong ..." in case of a server error', () => {

      cy.intercept(
        'GET',
        '**/search**',
        { statusCode: 500 },
      ).as('serverError')

      // cy.contains('.button','Submit').click()
      cy.visit('/')

      cy.wait('@serverError')

      cy.contains('p','Something went wrong ...').should('be.visible')
    })

    it('shows "Something went wrong ..." in case of a network error', () => {

      cy.intercept(
        'GET',
        '**/search**',
        { forceNetworkError: true}
      ).as('networkError')

      cy.visit('/')

      cy.wait('@networkError')

      cy.contains('p','Something went wrong ...').should('be.visible')

    })
  })

  it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**search**',
      {
        delay: 1000,
        fixture: 'stories'
      }
    ).as('loadingDelayed')

    cy.visit('/')

    cy.assertLoadingIsShownAndHidden()
    
    cy.wait('@loadingDelayed')

    cy.get('.item').should('have.length', 3)
  })

  describe('Hacker News Search', () => {
    const term = 'cypress.io'
  
    beforeEach(() => {
      cy.intercept(
        '**/search?query=redux&page=0&hitsPerPage=100',
        { fixture: 'emptyStories'}
      ).as('emptyStories')
      cy.intercept(
        `**/search?query=${term}&page=0&hitsPerPage=100`,
        { fixture: 'stories'}
      ).as('stories')
  
      cy.visit('https://hackernews-seven.vercel.app/')
      cy.wait('@emptyStories')
    })
  
    it('correctly caches the results', () => {
      
      const randomWord = faker.random.word()

      let count = 0
  
      cy.intercept(`**/search?query=${randomWord}**`, req => {
        count +=1
        req.reply({fixture: 'emptyStories'})
      }).as('random')
  
      cy.search(randomWord).then(() => {
        expect(count, `network calls to fetch ${randomWord}`).to.equal(1)
  
        cy.wait('@random')
  
        cy.search(term)
        cy.wait('@stories')
  
        cy.search(randomWord).then(() => {
          expect(count, `network calls to fetch ${randomWord}`).to.equal(1)
        })
      })
    })
  })
})