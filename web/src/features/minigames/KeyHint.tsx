function Key({ children }: { children: string }) {
  return (
    <span className="flex h-[2.6vh] min-w-[2.6vh] items-center justify-center rounded-[0.6vh] bg-white/10 px-[0.6vh] text-[1.15vh] font-bold uppercase">
      {children}
    </span>
  );
}

export function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-[0.5vh] text-[1.2vh] font-semibold text-text-3">
      {keys.map((k) => (
        <Key key={k}>{k}</Key>
      ))}
      <span className="ml-[0.3vh]">{label}</span>
    </span>
  );
}
