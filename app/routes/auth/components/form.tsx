export function FormAlert(props: {
  message?: string;
  submessage?: string;
  color?: "danger" | "success";
}) {
  const isSuccess = props.color === "success";
  const bg = isSuccess ? "bg-success-bg" : "bg-error-bg";
  const fg = isSuccess ? "text-success-fg" : "text-error-fg";

  return (
    <div
      className={`h-10 flex items-center px-4 ${bg} ${fg} text-left text-xs gap-2 ${!props.message ? "hidden" : ""}`}
    >
      {isSuccess ? (
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      )}
      <span>
        {props.message}
        {props.submessage && (
          <>
            <br />
            <span>{props.submessage}</span>
          </>
        )}
      </span>
    </div>
  );
}
