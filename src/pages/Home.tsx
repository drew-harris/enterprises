import { BaseHtml } from "../components/BaseHtml";

export const Home = () => {
  return (
    <BaseHtml>
      <div class="border-b border-b-purple-400/40 bg-purple-400/50 p-3 text-center text-xl font-bold shadow shadow-purple-950">
        Drew's HTMX Starter
      </div>
      <div class="flex justify-center pt-8">
        <a
          href="/signin"
          class={
            "cursor-pointer rounded-lg border border-purple-500/40 bg-purple-800/50 p-3 font-bold hover:bg-purple-800/70"
          }
        >
          Sign In With Github
        </a>
      </div>
    </BaseHtml>
  );
};
