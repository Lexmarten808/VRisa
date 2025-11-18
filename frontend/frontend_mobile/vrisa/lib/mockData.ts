// Copied mock data from desktop project for mobile usage (no relative re-export to avoid path issues)
export interface AirQualityData {
	pollutant: string;
	value: number;
	unit: string;
	status: 'good' | 'moderate' | 'unhealthy' | 'critical';
	limit: number;
}

export interface WeatherData {
	temperature: number;
	humidity: number;
	windSpeed: number;
	windDirection: string;
}

export interface Station {
	id: string;
	name: string;
	lat: number;
	lng: number;
	status: 'good' | 'moderate' | 'unhealthy' | 'critical';
	institution: string;
	pollutants: AirQualityData[];
}

export interface Institution {
	id: string;
	name: string;
	logo?: string;
	address: string;
	status: 'pending' | 'approved' | 'rejected';
	registeredDate: string;
	stationsCount: number;
}

export interface StationRequest {
	id: string;
	location: string;
	sensorType: string;
	variables: string[];
	responsible: string;
	status: 'pending' | 'approved' | 'rejected';
	institution: string;
	submittedDate: string;
}

export interface TrendReport {
	pollutant: string;
	direction: 'up' | 'down' | 'stable';
	changePct: number;
	period: '24h' | '7d' | '30d';
}

export interface CriticalAlert {
	id: string;
	time: string;
	pollutant: string;
	value: number;
	unit: string;
	threshold: number;
	station: string;
}

export interface MaintenanceReport {
	id: string;
	station: string;
	issue: string;
	status: 'pending' | 'scheduled' | 'done';
	scheduledDate?: string;
}

export const airQualityData: AirQualityData[] = [
	{ pollutant: 'PM2.5', value: 15.3, unit: 'µg/m³', status: 'good', limit: 25 },
	{ pollutant: 'PM10', value: 42.7, unit: 'µg/m³', status: 'moderate', limit: 50 },
	{ pollutant: 'SO2', value: 8.2, unit: 'µg/m³', status: 'good', limit: 20 },
	{ pollutant: 'NO2', value: 35.6, unit: 'µg/m³', status: 'moderate', limit: 40 },
	{ pollutant: 'O3', value: 68.4, unit: 'µg/m³', status: 'unhealthy', limit: 60 },
	{ pollutant: 'CO', value: 1.2, unit: 'mg/m³', status: 'good', limit: 4 },
];

export const weatherData: WeatherData = {
	temperature: 24.5,
	humidity: 68,
	windSpeed: 12.3,
	windDirection: 'NE',
};

export const stations: Station[] = [
	{
		id: 'EST-001',
		name: 'Centro',
		lat: 3.4516,
		lng: -76.5320,
		status: 'moderate',
		institution: 'Universidad del Valle',
		pollutants: [
			{ pollutant: 'PM2.5', value: 18.3, unit: 'µg/m³', status: 'good', limit: 25 },
			{ pollutant: 'PM10', value: 45.7, unit: 'µg/m³', status: 'moderate', limit: 50 },
		],
	},
	{
		id: 'EST-002',
		name: 'Norte',
		lat: 3.4816,
		lng: -76.5220,
		status: 'good',
		institution: 'DAGMA',
		pollutants: [
			{ pollutant: 'PM2.5', value: 12.1, unit: 'µg/m³', status: 'good', limit: 25 },
			{ pollutant: 'PM10', value: 28.4, unit: 'µg/m³', status: 'good', limit: 50 },
		],
	},
	{
		id: 'EST-003',
		name: 'Sur',
		lat: 3.4016,
		lng: -76.5420,
		status: 'unhealthy',
		institution: 'CVC',
		pollutants: [
			{ pollutant: 'PM2.5', value: 32.8, unit: 'µg/m³', status: 'unhealthy', limit: 25 },
			{ pollutant: 'PM10', value: 72.3, unit: 'µg/m³', status: 'unhealthy', limit: 50 },
		],
	},
	{
		id: 'EST-004',
		name: 'Oeste',
		lat: 3.4416,
		lng: -76.5620,
		status: 'moderate',
		institution: 'Universidad del Valle',
		pollutants: [
			{ pollutant: 'PM2.5', value: 21.5, unit: 'µg/m³', status: 'good', limit: 25 },
			{ pollutant: 'PM10', value: 48.9, unit: 'µg/m³', status: 'moderate', limit: 50 },
		],
	},
	{
		id: 'EST-005',
		name: 'Este',
		lat: 3.4516,
		lng: -76.5020,
		status: 'good',
		institution: 'DAGMA',
		pollutants: [
			{ pollutant: 'PM2.5', value: 14.2, unit: 'µg/m³', status: 'good', limit: 25 },
			{ pollutant: 'PM10', value: 31.6, unit: 'µg/m³', status: 'good', limit: 50 },
		],
	},
];

export const institutions: Institution[] = [
	{
		id: 'INST-001',
		name: 'Universidad del Valle',
		address: 'Calle 13 # 100-00, Cali',
		status: 'approved',
		registeredDate: '2024-01-15',
		stationsCount: 3,
	},
	{
		id: 'INST-002',
		name: 'DAGMA',
		address: 'Carrera 50 # 3-45, Cali',
		status: 'approved',
		registeredDate: '2024-02-20',
		stationsCount: 5,
	},
	{
		id: 'INST-003',
		name: 'CVC - Corporación Autónoma Regional',
		address: 'Carrera 56 # 11-36, Cali',
		status: 'pending',
		registeredDate: '2024-10-28',
		stationsCount: 0,
	},
	{
		id: 'INST-004',
		name: 'Instituto de Medio Ambiente de Cali',
		address: 'Avenida 6N # 28-75, Cali',
		status: 'pending',
		registeredDate: '2024-11-05',
		stationsCount: 0,
	},
];

export const stationRequests: StationRequest[] = [
	{
		id: 'REQ-001',
		location: 'Parque del Perro, Cali',
		sensorType: 'BAM-1020',
		variables: ['PM2.5', 'PM10', 'Temperatura', 'Humedad'],
		responsible: 'Dr. Carlos Mendoza',
		status: 'pending',
		institution: 'Universidad del Valle',
		submittedDate: '2024-11-08',
	},
	{
		id: 'REQ-002',
		location: 'Terminal de Transporte, Cali',
		sensorType: 'Teledyne T400',
		variables: ['O3', 'NO2', 'SO2'],
		responsible: 'Ing. María López',
		status: 'pending',
		institution: 'DAGMA',
		submittedDate: '2024-11-09',
	},
	{
		id: 'REQ-003',
		location: 'Zona Industrial Acopi',
		sensorType: 'BAM-1020 + Teledyne',
		variables: ['PM2.5', 'PM10', 'CO', 'NO2', 'SO2'],
		responsible: 'Ing. Roberto Gómez',
		status: 'approved',
		institution: 'CVC',
		submittedDate: '2024-10-30',
	},
];

export const historicalData = {
	'24h': [
		{ time: '00:00', PM25: 12, PM10: 28, O3: 45, NO2: 30 },
		{ time: '03:00', PM25: 10, PM10: 25, O3: 42, NO2: 28 },
		{ time: '06:00', PM25: 15, PM10: 35, O3: 38, NO2: 35 },
		{ time: '09:00', PM25: 22, PM10: 48, O3: 55, NO2: 42 },
		{ time: '12:00', PM25: 28, PM10: 58, O3: 68, NO2: 48 },
		{ time: '15:00', PM25: 25, PM10: 52, O3: 72, NO2: 45 },
		{ time: '18:00', PM25: 32, PM10: 65, O3: 65, NO2: 52 },
		{ time: '21:00', PM25: 18, PM10: 42, O3: 52, NO2: 38 },
		{ time: '23:00', PM25: 15, PM10: 38, O3: 48, NO2: 32 },
	],
	'7d': [
		{ day: 'Lun', PM25: 18, PM10: 42, O3: 58, NO2: 35 },
		{ day: 'Mar', PM25: 22, PM10: 48, O3: 62, NO2: 38 },
		{ day: 'Mié', PM25: 16, PM10: 38, O3: 55, NO2: 32 },
		{ day: 'Jue', PM25: 24, PM10: 52, O3: 68, NO2: 42 },
		{ day: 'Vie', PM25: 20, PM10: 45, O3: 65, NO2: 38 },
		{ day: 'Sáb', PM25: 14, PM10: 32, O3: 52, NO2: 28 },
		{ day: 'Dom', PM25: 12, PM10: 28, O3: 48, NO2: 25 },
	],
	'30d': [
		{ week: 'S1', PM25: 19, PM10: 44, O3: 60, NO2: 36 },
		{ week: 'S2', PM25: 21, PM10: 47, O3: 58, NO2: 38 },
		{ week: 'S3', PM25: 17, PM10: 40, O3: 55, NO2: 33 },
		{ week: 'S4', PM25: 23, PM10: 50, O3: 65, NO2: 40 },
	],
};

export const trendReports: TrendReport[] = [
	{ pollutant: 'PM2.5', direction: 'up', changePct: 12, period: '7d' },
	{ pollutant: 'PM10', direction: 'down', changePct: 8, period: '7d' },
	{ pollutant: 'O3', direction: 'up', changePct: 15, period: '24h' },
	{ pollutant: 'NO2', direction: 'stable', changePct: 1, period: '30d' }
];

export const criticalAlerts: CriticalAlert[] = [
	{ id: 'AL-001', time: '2025-11-10 14:35', pollutant: 'O3', value: 92, unit: 'µg/m³', threshold: 60, station: 'Sur' },
	{ id: 'AL-002', time: '2025-11-12 09:10', pollutant: 'PM10', value: 88, unit: 'µg/m³', threshold: 50, station: 'Centro' }
];

export const maintenanceReports: MaintenanceReport[] = [
	{ id: 'MT-001', station: 'Norte', issue: 'Reemplazo de filtro PM2.5', status: 'scheduled', scheduledDate: '2025-11-22' },
	{ id: 'MT-002', station: 'Oeste', issue: 'Calibración de sensor O3', status: 'pending' },
	{ id: 'MT-003', station: 'Sur', issue: 'Reparación de fuente de poder', status: 'done' }
];
