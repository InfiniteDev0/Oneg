// While an app page loads: the frame stays, and the panel shows the page's shape
// with Barista's sheen passing over it (AdminFrame / AdminTopBar's SHEEN).

export default function AppLoading() {
  const block = "oneg-sheen rounded-lg bg-black/5 dark:bg-white/5";
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      <span className={`${block} size-14 rounded-2xl`} />
      <span className={`${block} h-9 w-80 max-w-full`} />
      <span className={`${block} h-4 w-56 max-w-full`} />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <span className={`${block} h-28`} />
        <span className={`${block} h-28`} />
        <span className={`${block} h-28`} />
      </div>
    </div>
  );
}
