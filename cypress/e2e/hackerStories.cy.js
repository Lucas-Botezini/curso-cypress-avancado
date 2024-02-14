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

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()
      
      cy.wait('@searchNextReq')
      // cy.assertLoadingIsShownAndHidden()

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
        
      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`,
        
      ).as('searchNextTerm')

      cy.get('#search')
        .clear()
        .type(`${newTerm}{enter}`)

      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@searchNextTerm')

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

      cy.get('.item').should('have.length', 20)
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
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I assert on the data?
        // This is why this test is being skipped.
        // TODO: Find a way to test it out.
        it.skip('shows the right data for all rendered stories', () => {})
    
    
        it('shows one less story after dimissing the first story', () => {
        
          cy.get('.button-small')
            .first()
            .click()
        
          // cy.wait('@searchReq')
          
          cy.get('.item').should('have.length', 2)
        })
        
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context.skip('Order by', () => {
          it('orders by title', () => {})
    
          it('orders by author', () => {})
    
          it('orders by comments', () => {})
    
          it('orders by points', () => {})
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
  
      it('types and hits ENTER', () => {

        cy.get('#search')
          .type(`${newTerm}{enter}`)
  
        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')
  
        cy.get('.item').should('have.length', 3)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      it('types and clicks the submit button', () => {
        
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()
  
        cy.wait('@searchNextTerm')
        // cy.assertLoadingIsShownAndHidden()
  
        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
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
  
          cy.intercept({
            method: 'GET',
            url: '**/search**',
  
          }).as('searchMultipleTerms')
  
  
          
          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@searchMultipleTerms')
          })
  
          // cy.assertLoadingIsShownAndHidden()
  
          cy.get('.last-searches button')
            .should('have.length', 5)
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
})

