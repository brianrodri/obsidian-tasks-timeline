import { LoaderIcon } from "lucide-preact";

export function LoadingView() {
    return (
        <div class="ott">
            <span class="spinner">
                <LoaderIcon />
            </span>
        </div>
    );
}
