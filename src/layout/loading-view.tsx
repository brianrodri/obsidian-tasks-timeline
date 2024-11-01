import { LoaderIcon } from "lucide-preact";

export function LoadingView() {
    return (
        <div class="taskido">
            <span class="spinner">
                <LoaderIcon />
            </span>
        </div>
    );
}
