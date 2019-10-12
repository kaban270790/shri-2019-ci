import {Request, Response} from "express";
import readBuilds from "../readBuilds";

// noinspection HtmlUnknownTarget
const formBuild = `
<form action="/build" method="POST">
<div>
    <label>
        Repository: <input required name="repository" placeholder="repository">
    </label>
</div>
<div>
    <label>
        Commit hash: <input required name="commit_hash" placeholder="commit_hash">
    </label>
</div>
<div>
    <label>
        Run command: <textarea></textarea>
    </label>
</div>
<button type="submit">Submit</button>
</form>
`;

export default (req: Request, res: Response) => {
    readBuilds().then(builds => {
        let result = '';
        result += formBuild;
        builds.map((build) => {
            result += `<div><a href="/build/${build.name}">build #${build.name}</a></div>`;
        });
        res.header({'Content-Type': 'text/html'}).end(result);
    }).catch(reason => {
        res.status(500).end(reason);
    });
};
