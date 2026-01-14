import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyResultV2,
} from 'aws-lambda';

export const handler = async (
	_event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
	return {
		statusCode: 200,
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			ok: true,
			service: 'serverless-users-service',
			stage: process.env.STAGE || process.env.NODE_ENV || 'unknown',
			timestamp: new Date().toISOString(),
		}),
	};
};
