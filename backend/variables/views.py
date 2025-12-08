from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Variable


@api_view(['GET'])
def variables_list(request):
    try:
        vars_qs = Variable.objects.all().values('v_id', 'v_name', 'v_unit', 'v_type')
        return Response(list(vars_qs))
    except Exception as ex:
        return Response({'error': 'Could not fetch variables', 'detail': str(ex)}, status=500)
