export default function StorefrontAesthetic() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500 blur-[100px] rounded-full aesthetic-blob-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-indigo-500 blur-[90px] rounded-full aesthetic-blob-2" />
      <div className="absolute top-[40%] right-[10%] w-[25%] h-[35%] bg-amber-500/5 blur-[70px] rounded-full" />
    </div>
  );
}
