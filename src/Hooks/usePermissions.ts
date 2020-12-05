import { useState, useEffect } from 'react';
import { sqlite } from '../App';

export function usePermissions() {
  const [isGranted, setIsGranted] = useState(true);

  useEffect(() => {
    async function handlePermission(platform:string) {
        if(platform === "android") {
            const res = await sqlite.requestPermissions();
            if(!res.result) {
              setIsGranted(false);
            }
        }
    }
    sqlite.getPlatform().then((ret: { platform: string; })  => {
      handlePermission(ret.platform);

    });
  },[]);
  return isGranted;
}