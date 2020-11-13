import { useState, useEffect } from 'react';
import { useSQLite } from 'react-sqlite-hook/dist';

export function usePermissions(platform: string) {
  const [isGranted, setIsGranted] = useState(true);
  const {requestPermissions} = useSQLite();

  useEffect(() => {
    async function handlePermission(platform:string) {
        if(platform === "android") {
            const res = await requestPermissions();
            if(!res.result) {
              setIsGranted(false);
            }
        }
    }
    handlePermission(platform);
  },[requestPermissions,platform]);
  return isGranted;
}