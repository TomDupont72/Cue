import { MarkdownPage } from "@/components/layout/markdownPage";
import markdown from "@/content/legal/terms.md?raw";

export default function Terms() {
  return <MarkdownPage markdown={markdown} />;
}
