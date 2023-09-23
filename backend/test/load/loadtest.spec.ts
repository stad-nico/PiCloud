import { check } from 'k6';
import http from 'k6/http';

const file = open('C:\\Users\\stadl\\Desktop\\mysql.txt', 'b');

export let options = {
	vus: 1,
	iterations: 100,
};

var i = 0;

export default function () {
	const data = {
		file: http.file(file, 'test.txt'),
	};

	const request = http.post('http://localhost:3000/files/tesw' + ++i + 'st.txt', data);

	check(request, {
		'status is fine': (r) => r.status < 0,
	});

	// sleep(0.1);
}
