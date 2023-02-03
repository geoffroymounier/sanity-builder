import React from 'react';
import { GetStaticProps } from 'next';

import { Meta } from 'layout/Meta';
import PageContent from 'layout/PageContent';
import Main from 'templates/Main';
import { fetchPagesFromSanity } from 'utils/Sanity';

export type PageProps = {
  page: Record<string, any>;
};

const Index = (props: any) => (
  <Main
    header={props.page.header}
    footer={props.page.footer}
    banner={props.page.banner}
    meta={<Meta title={`Nego-Plus`} description={props.page.description} />}
  >
    <PageContent
      classes={props.page.classes}
      style={props.page.style}
      blocks={props.page.content}
    />
  </Main>
);

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const page = (await fetchPagesFromSanity('index'))[0];

  return {
    props: {
      page,
    },
  };
};

export default Index;
