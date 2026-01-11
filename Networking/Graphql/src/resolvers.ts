//  * Map schema fields → actual data/functions

export const resolvers = {
  Query: {
    authors: () => {
      const mock = [
        {
          id: 1,
          name: 'Ram',
        },
        {
          id: 2,
          name: 'Sayan',
        },
      ];
      return mock;
    },

    books: () => {
      const mock = [
        {
          id: 1,
          title: 'Namo',
        },
        {
          id: 2,
          name: 'Bhakol',
          publishedYear: 2026,
        },
      ];
      return mock;
    },
  },
};
