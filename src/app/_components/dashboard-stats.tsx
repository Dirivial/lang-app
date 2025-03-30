import { cn } from "~/lib/utils";

const loginHistory: { id: number; date: Date; volume: number }[] = [];

export function LoginHistory() {
  //const trpc = useTRPC();
  // const { data: languages } = useSuspenseQuery(
  //   trpc.language.all.queryOptions(),
  // );

  if (loginHistory.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <LoginHistoryCardSkeleton pulse={true} />
        <LoginHistoryCardSkeleton pulse={true} />
        <LoginHistoryCardSkeleton pulse={true} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">
            Some statistics will appear here...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {loginHistory.map((l) => {
        return <LoginHistoryCard key={l.id.toString()} login={l} />;
      })}
    </div>
  );
}

export function LoginHistoryCardSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props;
  return (
    <div className="bg-muted flex flex-row rounded-lg p-4">
      <div className="flex-grow">
        <h2
          className={cn(
            "bg-primary w-1/4 rounded text-2xl font-bold",
            pulse && "animate-pulse",
          )}
        >
          &nbsp;
        </h2>
        <p
          className={cn(
            "mt-2 w-1/3 rounded bg-current text-sm",
            pulse && "animate-pulse",
          )}
        >
          &nbsp;
        </p>
      </div>
    </div>
  );
}

export function LoginHistoryCard(props: {
  login: { id: number; date: Date; volume: number };
}) {
  return (
    <div className="bg-muted flex flex-row rounded-lg p-4">
      <div className="flex-grow">
        <h2 className="text-primary text-2xl font-bold">
          {props.login.date.toString()}
        </h2>
        <p className="mt-2 text-sm">{props.login.volume}</p>
      </div>
    </div>
  );
}
