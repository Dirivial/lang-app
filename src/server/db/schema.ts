import { relations } from "drizzle-orm";
import { pgEnum, pgTable, primaryKey } from "drizzle-orm/pg-core";

// export const Post = pgTable("post", (t) => ({
//   id: t.uuid().notNull().primaryKey().defaultRandom(),
//   title: t.varchar({ length: 256 }).notNull(),
//   content: t.text().notNull(),
//   createdAt: t.timestamp().defaultNow().notNull(),
//   updatedAt: t
//     .timestamp({ mode: "date", withTimezone: true })
//     .$onUpdateFn(() => sql`now()`),
// }));

export const User = pgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).notNull(),
  emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
  image: t.varchar({ length: 255 }),
}));

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const Account = pgTable(
  "account",
  (t) => ({
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: t
      .varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: t.varchar({ length: 255 }).notNull(),
    providerAccountId: t.varchar({ length: 255 }).notNull(),
    refresh_token: t.varchar({ length: 255 }),
    access_token: t.text(),
    expires_at: t.integer(),
    token_type: t.varchar({ length: 255 }),
    scope: t.varchar({ length: 255 }),
    id_token: t.text(),
    session_state: t.varchar({ length: 255 }),
  }),
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

// Supported languages (e.g., German, Swedish, Chinese)
export const Language = pgTable("language", (t) => ({
  id: t.serial("id").primaryKey(),
  code: t.varchar("code", { length: 5 }).notNull().unique(), // 'de', 'sv', 'zh'
  name: t.varchar("name", { length: 50 }).notNull(), // 'German', 'Swedish'
  isRtl: t.boolean("is_rtl").default(false), // Right-to-left (e.g., Arabic)
}));

export const LanguageRelations = relations(Language, ({ many }) => ({
  word: many(Word),
}));

export const coreWordTypeEnum = pgEnum("coreWordType", [
  "null",
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
]);

export const LanguageWordTypes = pgTable("language_word_types", (t) => ({
  id: t.serial("id").primaryKey(),
  languageId: t
    .integer("language_id")
    .references(() => Language.id, { onDelete: "cascade" }),
  name: t.varchar("name", { length: 50 }).notNull(), // 'Article', 'Measure Word'
  code: t.varchar("code", { length: 20 }).notNull(), // 'ARTICLE', 'MEASURE_WORD'
}));

export const Word = pgTable("word", (t) => ({
  id: t.serial("id").primaryKey(),
  text: t.varchar({ length: 255 }).notNull(), // Should be lower-case
  pinyin: t.varchar({ length: 255 }), // For Chinese (e.g., 'nǐ hǎo')
  definition: t.text().notNull().default(""),
  type: coreWordTypeEnum().default("null"),
  createdAt: t.timestamp("created_at").defaultNow(),
  // Relations
  languageId: t
    .integer("language_id")
    .notNull()
    .references(() => Language.id, { onDelete: "cascade" }),
}));

export const WordRelations = relations(Word, ({ one, many }) => ({
  language: one(Language, {
    fields: [Word.languageId],
    references: [Language.id],
  }),
  nounDetails: one(NounDetails),
  typeCustom: one(LanguageWordTypes),
  nounCase: many(NounCase),
  verbConjugation: many(VerbConjugation),
}));

// Chinese measure words
export const MeasureWord = pgTable("measure_words", (t) => ({
  id: t.serial("id").primaryKey(),
  wordId: t
    .integer("word_id")
    .references(() => Word.id, { onDelete: "cascade" }), // Noun (e.g., '书')
  measureWordId: t
    .integer("measure_word_id")
    .references(() => Word.id, { onDelete: "cascade" }), // '本' (for books)
}));

export const MeasureWordRelations = relations(MeasureWord, ({ one }) => ({
  word: one(Word, {
    fields: [MeasureWord.wordId],
    references: [Word.id],
  }),
  measureWord: one(Word, {
    fields: [MeasureWord.measureWordId],
    references: [Word.id],
  }),
}));

export const NounDetails = pgTable("noun_details", (t) => ({
  id: t.serial("id").primaryKey(),
  gender: t.varchar({ length: 5 }), // Should be lower-case
  definiteForm: t.varchar("definite_form", { length: 255 }),
  pluralForm: t.varchar("plural_form", { length: 255 }),
  // Relations
  wordId: t
    .integer("word_id")
    .references(() => Word.id, { onDelete: "cascade" }),
}));

export const NounDetailsRelations = relations(NounDetails, ({ one }) => ({
  Word: one(Word, {
    fields: [NounDetails.wordId],
    references: [Word.id],
  }),
}));

// A specific noun case (Nominativ/Akkusativ/Dativ/Genitiv) of a noun
export const NounCase = pgTable("noun_case", (t) => ({
  id: t.serial("id").primaryKey(),
  gender: t.varchar({ length: 5 }), // Should be lower-case
  caseType: t.varchar("case_type", { length: 20 }), // "Nominativ/Akkusativ/..."
  article: t.varchar("article", { length: 10 }), // 'der', 'den', 'dem'
  form: t.varchar("form", { length: 255 }), // e.g. 'Hund', 'Hunde'
  // Relations
  wordId: t
    .integer("word_id")
    .references(() => Word.id, { onDelete: "cascade" }),
}));

export const NounCaseRelations = relations(NounCase, ({ one }) => ({
  nounDetails: one(Word, {
    fields: [NounCase.wordId],
    references: [Word.id],
  }),
}));

// A specific conjugation of a verb
export const VerbConjugation = pgTable("verb_conjugation", (t) => ({
  id: t.serial("id").primaryKey(),
  text: t.varchar("text", { length: 255 }).notNull(),
  tense: t.varchar("tense", { length: 20 }).notNull(),
  pronoun: t.varchar("pronoun", { length: 20 }), // Null for Swedish
  // Relations
  wordId: t
    .integer("word_id")
    .references(() => Word.id, { onDelete: "cascade" }),
}));

export const VerbConjugationRelations = relations(
  VerbConjugation,
  ({ one }) => ({
    word: one(Word, {
      fields: [VerbConjugation.wordId],
      references: [Word.id],
    }),
  }),
);

export const Translation = pgTable("translation", (t) => ({
  id: t.serial("id").primaryKey(),
  sourceWordId: t.integer("source_word_id").references(() => Word.id),
  targetWordId: t.integer("target_word_id").references(() => Word.id),
  confidence: t.integer("confidence").default(1), // Machine translation score (optional)
}));

export const TranslationRelations = relations(Translation, ({ one }) => ({
  sourceWord: one(Word, {
    fields: [Translation.sourceWordId],
    references: [Word.id],
  }),
  targetWord: one(Word, {
    fields: [Translation.targetWordId],
    references: [Word.id],
  }),
}));
