import { MarkdownPage } from "@/components/layout/markdownPage";
import markdown from "@/content/legal/privacy.md?raw";

export default function Privacy() {
  return <MarkdownPage markdown={markdown} />;
}
