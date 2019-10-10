import {Dirent, readdir} from 'fs';
import {resolve as pathResolve} from 'path';

export default () => (new Promise<Dirent[]>((resolve, reject) => {

    readdir(pathResolve(__dirname, '..', 'data_base', 'results'), {withFileTypes: true}, (err, files) => {
        if (err) {
            reject(err);
        }
        resolve(files);
    })
})).then((files: Dirent[]) => {
    return files.filter(value => value.isDirectory());
});