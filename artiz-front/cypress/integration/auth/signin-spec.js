describe('The signin page', function() {
  beforeEach(function() {
    cy.visit('/auth/signin')
    cy.get('.btn').should('be.disabled');
  })
  it('successfully authenticate', function() {
    const username =  'artiz'
    const password = 'artiz'

    cy.get('input[id=username]').type(username)
    cy.get('input[id=password]').type(`${password}{enter}`)
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
  it('echec authenticate', function() {
    const username =  'artiz'
    const password = 'coucou'
    cy.visit('/auth/signin')
    cy.get('input[id=username]').type(username)
    cy.get('input[id=password]').type(`${password}{enter}`)
    cy.url().should('eq', Cypress.config().baseUrl + '/auth/signin')
    cy.get('p.text-danger').contains('Une erreur')
  })
})
