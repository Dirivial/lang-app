import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey, pgEnum } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `lang-app_${name}`);

export const User = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const userRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const Account = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => User.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));
export const Session = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => User.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

export const VerificationToken = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Supported languages (e.g., German, Swedish, Chinese)
export const Language = createTable("language", (t) => ({
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

export const LanguageWordTypes = createTable("language_word_types", (t) => ({
  id: t.serial("id").primaryKey(),
  languageId: t
    .integer("language_id")
    .references(() => Language.id, { onDelete: "cascade" }),
  name: t.varchar("name", { length: 50 }).notNull(), // 'Article', 'Measure Word'
  code: t.varchar("code", { length: 20 }).notNull(), // 'ARTICLE', 'MEASURE_WORD'
}));

export const Word = createTable("word", (t) => ({
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
export const MeasureWord = createTable("measure_words", (t) => ({
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

export const NounDetails = createTable("noun_details", (t) => ({
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
export const NounCase = createTable("noun_case", (t) => ({
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
export const VerbConjugation = createTable("verb_conjugation", (t) => ({
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

export const Translation = createTable("translation", (t) => ({
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
