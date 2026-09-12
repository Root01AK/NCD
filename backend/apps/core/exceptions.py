from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardize all DRF and unhandled exception responses to match frontend contract:
    {
        "status": "error",
        "message": "...",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'status': 'error',
            'message': 'An error occurred while processing your request.',
            'errors': response.data
        }

        # Extract readable string message if available
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_data['message'] = str(response.data['detail'])
            elif 'message' in response.data:
                custom_data['message'] = str(response.data['message'])
            else:
                first_err = next(iter(response.data.values()), None)
                if isinstance(first_err, list) and len(first_err) > 0:
                    custom_data['message'] = str(first_err[0])
                elif isinstance(first_err, str):
                    custom_data['message'] = first_err
        elif isinstance(response.data, list) and len(response.data) > 0:
            custom_data['message'] = str(response.data[0])

        response.data = custom_data
        return response

    # Catch-all for uncaught 500 server errors
    logger.exception("Unhandled server exception", exc_info=exc)
    return Response({
        'status': 'error',
        'message': f'Server Error: {str(exc)}',
        'error_type': exc.__class__.__name__
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
