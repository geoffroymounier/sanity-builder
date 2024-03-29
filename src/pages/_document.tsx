import React from 'react';
import { ServerStyleSheet } from 'styled-components'
import Document, {
  Html, Head, Main, NextScript,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }
  render() {


    return (
      <Html lang="en">
        <Head>
          {/* {process.env.NODE_ENV !== 'production' && <script
            dangerouslySetInnerHTML={{
              __html: 'window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function () {}',
            }}
          />} */}
        </Head>

        <body>
          <Main />
          <NextScript />
          <div id="portal-root" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
