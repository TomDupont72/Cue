import { MarkdownPage } from "@/components/layout/markdownPage";
import markdown from "@/content/legal/legal.md?raw";

export default function Legal() {
  return <MarkdownPage markdown={markdown} />;
}
