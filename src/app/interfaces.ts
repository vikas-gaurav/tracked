export interface ITruck {
    id: string;
    name: string;
    truckNumber: string;
    lastWaypoint: {
        lat : number;
        lng : number;
        speed: number;
        ignitionOn: boolean;
        createTime: number;
    };
    lastRunningState: {
        stopStartTime: number;
        truckRunningState: 0 | 1;
    }
}