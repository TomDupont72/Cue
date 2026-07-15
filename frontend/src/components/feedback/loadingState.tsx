import { Spinner } from "../ui/spinner";

export function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}
