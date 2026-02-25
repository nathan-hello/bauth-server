import type { ComponentProps } from "react";

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-4 bg-surface-raised border border-border text-fg text-sm outline-none focus:border-fg-muted ${props.className ?? ""}`}
    />
  );
}

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

const buttonBase =
  "h-10 cursor-pointer font-medium text-sm flex gap-3 items-center justify-center px-4";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-surface border-0 disabled:bg-primary/50",
  ghost: "bg-transparent text-fg border border-border",
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${buttonBase} ${buttonVariants[variant]} ${props.className ?? ""}`}
    />
  );
}

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: ButtonVariant;
};

export function ButtonLink({ variant = "ghost", ...props }: ButtonLinkProps) {
  return (
    <a
      {...props}
      className={`${buttonBase} no-underline ${buttonVariants[variant]} ${props.className ?? ""}`}
    />
  );
}

export function TextLink(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`underline underline-offset-2 font-semibold bg-transparent border-0 cursor-pointer text-fg p-0 ${props.className ?? ""}`}
    />
  );
}

type CardProps = ComponentProps<"div"> & {
  size?: "default" | "small";
};

export function Card({ ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`lg:w-lg xl:w-xl flex flex-col gap-6 p-4 bg-surface opacity-95 ${props.className ?? ""}`}
    />
  );
}

export function FormLayout(props: ComponentProps<"div"> | ComponentProps<"form">) {
  const Tag = "method" in props ? "form" : "div";
  return (
    // @ts-expect-error polymorphic tag
    <Tag {...props} className={`max-w-full flex flex-col gap-4 m-0 ${props.className ?? ""}`} />
  );
}

export function FormFooter(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`flex gap-4 text-xs items-center justify-center ${props.className ?? ""}`}
    />
  );
}

export function Label(props: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={`flex gap-3 flex-col text-xs text-fg-muted ${props.className ?? ""}`}
    />
  );
}
