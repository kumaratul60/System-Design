//  * Map schema fields → actual data/functions
// * resolvers[TypeName][fieldName]: always
// resolvers[TypeName][ReturnType]: never

/**
 * parent   → The **current Book object**
 *            Returned by the parent resolver (Query.books)
 *            Example:
 *            {
 *              id: "101",
 *              title: "Book 1",
 *              publishedYear: 2000,
 *              authorId: "1"
 *            }
 *
 * args     → Field arguments from the query
 *            (none here → {})
 *
 * context  → Shared per-request data
 *            (auth, user, db, loaders, etc.)
 *
 * info     → Execution metadata
 *            (field name, path, schema, fragments)
 *
 * return   → Must match schema field type
 *            Here: Author | null
 *
 * parent = previous resolver’s return
 * args = query arguments
 * context = request-scoped shared state
 * info = GraphQL internals
 * return = data for this field (shape must match schema)
 */

const mockData: {
  books: Book[];
  authors: Author[];
} = {
  authors: [
    { id: '1', name: 'Author 1', bookIds: ['101', '102'] },
    { id: '2', name: 'Author 2', bookIds: ['103'] },
    { id: '3', name: 'Author 3', bookIds: ['104', '105'] },
  ],
  books: [
    { id: '101', title: 'Book 1', publishedYear: 2000, authorId: '1' },
    { id: '102', title: 'Book 2', publishedYear: 2010, authorId: '1' },
  ],
};

type Book = {
  id: string;
  title: string;
  publishedYear?: number;
  authorId: string;
};

type Author = {
  id: string;
  name: string;
  // bookIds: Array<string>;
  bookIds: string[];
};

type AddBookArgs = {
  title: string;
  publishedYear?: number;
  authorId: string;
};

export const resolvers = {
  Book: {
    author: (parent: Book, args: string, context: string, info: string) => {
      // console.log({ parent, args, context, info });
      return mockData.authors.find((author) => author.id === parent.authorId);
    },
  },

  Author: {
    books: (parent: Author) => {
      return mockData.books.filter((book) => parent.bookIds.includes(book.id));
    },
  },

  Query: {
    authors: () => {
      return mockData.authors;
    },

    books: () => mockData.books,
  },

  Mutation: {
    addBook: (_parent: unknown, args: AddBookArgs) => {
      // console.log(args);
      const newBook = {
        id: String(mockData.books.length + 1),
        ...args,
      };

      mockData.books.push(newBook);
      return newBook;
    },
  },
};
