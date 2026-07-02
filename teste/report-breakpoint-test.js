import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '5s', target: 450 }, 
        { duration: '25s', target: 450 }, 
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate==0'],
        checks: ['rate==1.0'],
    },
};

export default function () {
    const res = http.get('http://localhost:3001/report');

    check(res, {
        'Status 200': (r) => r.status === 200,
        'Tempo < 500 ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}