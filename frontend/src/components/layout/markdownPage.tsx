import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageContainer } from "./pageContainer";
import { Heading } from "./heading";
import { Text } from "./text";
import { useTranslation } from "react-i18next";
import { parse } from "yaml";
import { ScrollToTop } from "./scrollToTop";

type MarkdownPageProps = {
  markdown: string;
};

type MarkdownMetadata = {
  title?: string;
  updatedAt?: string;
};

function parseMarkdown(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: {} as MarkdownMetadata,
      content: markdown
    };
  }

  return {
    data: parse(match[1]) as MarkdownMetadata,
    content: match[2]
  };
}

export function MarkdownPage({ markdown }: MarkdownPageProps) {
  const { data, content } = parseMarkdown(markdown);
  const { t } = useTranslation();

  return (
    <>
      <ScrollToTop />
      <PageContainer className="gap-4">
        {data.title && <Heading level={1}>{data.title}</Heading>}

        {data.updatedAt && (
          <Text>
            {t("common:date.lastUpdate")} : {data.updatedAt}
          </Text>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => <Heading level={2}>{children}</Heading>,

            h3: ({ children }) => <Heading level={3}>{children}</Heading>,

            h4: ({ children }) => <Heading level={4}>{children}</Heading>,

            h5: ({ children }) => <Heading level={5}>{children}</Heading>,

            p: ({ children }) => <Text>{children}</Text>
          }}
        >
          {content}
        </ReactMarkdown>
      </PageContainer>
    </>
  );
}
