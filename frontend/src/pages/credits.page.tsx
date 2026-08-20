import { MarkdownPage } from "@/components/layout/markdownPage";
import markdown from "@/content/legal/credits.md?raw";

export default function Credits() {
  return <MarkdownPage markdown={markdown} />;
}
