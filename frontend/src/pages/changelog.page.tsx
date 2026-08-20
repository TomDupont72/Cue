import { MarkdownPage } from "@/components/layout/markdownPage";
import markdown from "@/content/release/changelog.md?raw";

export default function Changelog() {
  return <MarkdownPage markdown={markdown} />;
}
