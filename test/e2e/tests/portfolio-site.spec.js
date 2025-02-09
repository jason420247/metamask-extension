const { strict: assert } = require('assert');
const {
  withFixtures,
  unlockWallet,
  defaultGanacheOptions,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');
const { emptyHtmlPage } = require('../mock-e2e');

describe('Portfolio site', function () {
  async function mockPortfolioSite(mockServer) {
    return await mockServer
      .forGet('https://portfolio.metamask.io/')
      .withQuery({
        metamaskEntry: 'ext_portfolio_button',
        metametricsId: 'null',
      })
      .thenCallback(() => {
        return {
          statusCode: 200,
          body: emptyHtmlPage(),
        };
      });
  }

  it('should link to the portfolio site @no-mmi', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder().build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.fullTitle(),
        testSpecificMock: mockPortfolioSite,
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        // Click Portfolio site
        if (process.env.MULTICHAIN) {
          await driver.clickElement('[data-testid="token-balance-portfolio"]');
        } else {
          await driver.clickElement('[data-testid="eth-overview-portfolio"]');
        }
        await driver.waitUntilXWindowHandles(2);
        const windowHandles = await driver.getAllWindowHandles();
        await driver.switchToWindowWithTitle('E2E Test Page', windowHandles);

        // Verify site
        assert.equal(
          await driver.getCurrentUrl(),
          'https://portfolio.metamask.io/?metamaskEntry=ext_portfolio_button&metametricsId=null',
        );
      },
    );
  });
});
