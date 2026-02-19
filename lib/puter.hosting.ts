 /*
 This file will handle the upload of images to the computer hosted domain. Within this file we need to create a function
 that checks if a subdomain is present in the key value store puter's database, if not it will create a new one and store
 that subdomain in key value pairs
  */
 import puter from "@heyputer/puter.js";
 import {
 createHostingSlug,
 fetchBlobFromUrl, getHostedUrl,
 getImageExtension,
 HOSTING_CONFIG_KEY,
 imageUrlToPngBlob,
 isHostedUrl
} from "./utils";


 export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;

    if (existing?.subdomain ) return  { subdomain: existing.subdomain };

    const subdomain = createHostingSlug();

    try{
        const created = await puter.hosting.create(subdomain,'.');

        const record = {subdomain : created.subdomain}; // this way we save the record so it wont and try to recreate it every single time
        await puter.kv.set(HOSTING_CONFIG_KEY, record);
        return record;

    }catch(err){
     console.log(`Could not find subdomain: ${err}`);
     return null;
    }
 }

 // takes 64x string of image and upload them on the puter subdomain
 export const uploadImageToHosting = async({ hosting, url, projectId, label}: StoreHostedImageParams): Promise<HostedAsset | null> => {

  if(!hosting || !url) return null;
  if(isHostedUrl(url))return {url}

  try{
   const resolved = label === "rendered" ? await imageUrlToPngBlob(url).then((blob) => blob ? {blob, contentType: "image/jpeg"} : null)
       : await fetchBlobFromUrl(url)

   if(!resolved) return null;

   const contentType = resolved.contentType || resolved.blob.type || '';
   const ext = getImageExtension(contentType,url)
   const dir = `projects/${projectId}`;
   const filePath = `${dir}/${label}.${ext}`;

   const uploadFile = new File([resolved.blob], `${label}.${ext}`, {type: contentType});

   await puter.fs.mkdir(dir, { createMissingParents: true });
   await puter.fs.write(filePath, uploadFile);

   const hostedUrl = getHostedUrl({subdomain: hosting.subdomain},filePath);
   return hostedUrl ? {url: hostedUrl} : null;
  }catch(e) {
   console.error(`Failed to upload image: ${e}`);
   return null;
  }
 }