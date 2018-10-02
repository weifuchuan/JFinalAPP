import qs from 'qs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
const RNFetchBlob = require('rn-fetch-blob').default;

export const baseUrl = __DEV__ ? 'http://192.168.1.102:8000' : 'http://www.jfinal.com';
// export const baseUrl = 'http://192.168.1.102:8000';
// export const baseUrl = 'http://www.jfinal.com';

export async function GET<Result = any>(
	uri: string,
	params?: any,
	config?: AxiosRequestConfig
): Promise<AxiosResponse<Result>> {
	uri = params ? uri + '?' + qs.stringify(params) : uri;
	return await axios.get(`${baseUrl}${uri}`, config);
}

export async function GET_HTML(uri: string, params?: any): Promise<string> {
	const resp = await GET(uri, params, {
		responseType: 'text'
	});
	return resp.data;
} 

export async function GET_FETCH_HTML(url: string, params?: any): Promise<string> {
	url = params ? url + '?' + qs.stringify(params) : url;
	const resp = await RNFetchBlob.fetch('GET', url, {
		'user-agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
	});
	return resp.text();
}

export async function POST<Result = any>(
	uri: string,
	data?: any,
	config?: AxiosRequestConfig
): Promise<AxiosResponse<Result>> {
	return await axios.post(`${baseUrl}${uri}`, data, config);
}

export async function POST_FORM<Result = any>(
	uri: string,
	form: any,
	config: AxiosRequestConfig = {}
): Promise<AxiosResponse<Result>> {
	const resp = await POST(uri, qs.stringify(form), {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		...config
	});
	return resp;
}

type FilePath = string;

export async function updateFile(
	uri: string,
	files: { [name: string]: FilePath },
	otherParams: { [name: string]: string } = {}
): Promise<any> {
	let formData = new FormData();
	for (let name in files) {
		formData.append(name, {
			uri: files[name],
			type: 'multipart/form-data',
			name: files[name].substring(files[name].lastIndexOf('/') + 1)
		} as any);
	}
	for (let name in otherParams) {
		formData.append(name, otherParams[name]);
	}
	const resp = await POST(uri, formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
	return resp;
}
