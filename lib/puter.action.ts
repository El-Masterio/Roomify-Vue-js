import puter from "@heyputer/puter.js";
import type {User} from "@heyputer/puter.js/types/modules/auth";
import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl, PROJECT_PREFIX} from "./utils";

export const signIn = async () => await puter.auth.signIn();

export const signOut =  () =>  puter.auth.signOut();

export const getCurrentUser = async () => {

    try{
        return await puter.auth.getUser();
    }catch(error){
        return null
    }

}

export const getProject = async (id: string): Promise<DesignItem | null> => {
    try {
        const project = await puter.kv.get(`${PROJECT_PREFIX}${id}`);
        return project as DesignItem | null;
    } catch (error) {
        console.error('Failed to get Project', error);
        return null;
    }
}

export const createProject = async ({item}: CreateProjectParams): Promise<DesignItem | null | undefined> => {

    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting({hosting, url: item.sourceImage, projectId, label: 'source'})
        :null;
    const hostedRender = projectId && item.renderedImage ? await uploadImageToHosting({hosting, url: item.renderedImage, projectId, label: 'rendered'})
        :null;

    const resolvedSource = hostedSource ?.url ||
        (isHostedUrl(item.sourceImage)? item.sourceImage : '');

    if (!resolvedSource) {
        console.warn('Failed to host source image, skipping save.');
        return null;
    }
    const resolvedRender = hostedRender ?  hostedRender?.url :
        item?.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
    }

    try{
        // Call the Puter worker to store project in kv
        await puter.kv.set(`${PROJECT_PREFIX}${projectId}`, payload);

    return payload

    }catch(error){
        console.error('Failed to save Project', error);
    }

}