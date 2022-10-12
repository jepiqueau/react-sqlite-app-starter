import React from 'react';
import './TestOutput.css';
import { IonCard,IonCardContent } from '@ionic/react';
const TestOutput = (props:{dataLog: string[], errMess: string}) => {
    return (
        <IonCard className="container-testoutput">
            
            <IonCardContent>
                <ul>
                {props.dataLog.map((log: string, index: number) => (
                    <li key={index}>{log}</li>
                ))}
                </ul>
                {props.errMess.length > 0 && <p>{props.errMess}</p>}
            </IonCardContent>
        </IonCard>
  );

};
export default TestOutput;
