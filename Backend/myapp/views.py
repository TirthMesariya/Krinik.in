from django.shortcuts import render,redirect
from .serializers import*
from .models import*
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.utils import timezone
import razorpay
# Create your views here.

def index(request):
    return render(request,"index.html")

def about(request):
    return render(request,"about.html")

def Faq(request):
    return render(request,"Faq.html")

def footcopy(request):
    return render(request,"footcopy.html")

def Privacypolicy(request):
    return render(request,"Privacypolicy.html")

def Refundpolicy(request):
    return render(request,"Refundpolicy.html")

def termandconditions(request):
    return render(request,"termandconditions.html")    
    


class player_team(APIView):
    def get(self, request, id=None):
        player_name = request.GET.get("player_name", id)  # Get player_name from request parameters, default to "v" if not provided

        try:
            # Fetch the player object
            player = Player.objects.get(id=id)

            # Find matches where the player is in select_player_A or select_player_B
            matches_A = Match.objects.filter(select_player_A=player)
            matches_B = Match.objects.filter(select_player_B=player)

            # Prepare a response
            response = [[]]
            total_runs = 0

            # For matches where the player is in select_player_A, the opponent team is select_team_B
            for match in matches_A:
                opponent_team = match.select_team_B
                pool_declarations = Pool_Declare.objects.filter(player_declare=player, select_match=match)
                match_total_runs = pool_declarations.aggregate(Sum('total_run'))['total_run__sum'] or 0
                total_runs += match_total_runs
                response[0].append({
                    "match": match.match_display_name,
                    "player_team": match.select_team_A.team_name,
                    "player_league": match.select_league.league_name,
                    "opponent_team": opponent_team.team_name,
                    "match_date":match.match_start_date,
                    "runs": match_total_runs
                })

            # For matches where the player is in select_player_B, the opponent team is select_team_A
            for match in matches_B:
                opponent_team = match.select_team_A
                pool_declarations = Pool_Declare.objects.filter(player_declare=player, select_match=match)
                match_total_runs = pool_declarations.aggregate(Sum('total_run'))['total_run__sum'] or 0
                total_runs += match_total_runs
                response[0].append({
                    "match": match.match_display_name,
                    "player_team": match.select_team_B.team_name,
                    "player_league": match.select_league.league_name,
                    "opponent_team": opponent_team.team_name,
                    "match_date":match.match_start_date,
                    "runs": match_total_runs
                })

            response.append({"total_runs": total_runs})

            return Response(response, status=status.HTTP_200_OK)

        except Player.DoesNotExist:
            return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#------------------League View---------------------

#==================


class League_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=League.objects.get(id=id)
                serializer=League_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=League.objects.all().order_by("-id")
            serializer=League_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=League_serializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=League.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=League_serializers(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})





    def delete(self,request,id=None):
        if id:
            try:
                uid=League.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})



#---------------Team View----------------------



class Team_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=Team.objects.get(id=id)
                serializer=Team_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=Team.objects.all().order_by("-id")
            serializer=Team_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=Team_serializers(data=request.data)
        print(serializer)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=Team.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=Team_serializers(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def delete(self,request,id=None):
        if id:
            try:
                uid=Team.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})






#---------------Player View----------------------

class Player_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=Player.objects.get(id=id)
                serializer=Player_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=Player.objects.all().order_by("-id")
            serializer=Player_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=Player_serializers(data=request.data)
        print(serializer)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=Player.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=Player_serializers(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def delete(self,request,id=None):
        if id:
            try:
                uid=Player.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})





#---------------Pool View----------------------
class pool_view(APIView):
    def get(self, request, id=None):
        if id:
            try:
                uid = Pool.objects.get(id=id)
                serializer = PoolSerializer(uid)
                return Response({'status': 'success', 'data': serializer.data})
            except Pool.DoesNotExist:
                return Response({'status': "Invalid"})
        else:
            uid = Pool.objects.all().order_by("-id")
            serializer = PoolSerializer(uid, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = PoolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def patch(self, request, id=None):
        try:
            uid = Pool.objects.get(id=id)
        except Pool.DoesNotExist:
            return Response({'status': "invalid data"})

        serializer = PoolSerializer(uid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def delete(self, request, id=None):
        if id:
            try:
                uid = Pool.objects.get(id=id)
                uid.delete()
                return Response({'status': 'Deleted data'})
            except Pool.DoesNotExist:
                return Response({'status': "invalid id"})
        else:
            return Response({'status': "invalid data"})






#---------------Pair View----------------------
# pair_1


# class Pair_view(APIView):
#     def get(self, request, id=None,pool_id=None):
#         if id:
#             try:
#                 pair = Pair.objects.get(id=id)
#                 serializer = PairSerializer(pair)
#                 return Response({'status': 'success', 'data': serializer.data})
#             except Pair.DoesNotExist:
#                 return Response({'status': 'Invalid id'})
#         elif pool_id:
#             try:
#                 print(pool_id)
#                 uid = Pair.objects.filter(pool_name__id=pool_id)
#                 if uid.exists():
#                     serializer = PairSerializer(uid, many=True)
#                     return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
#                 else:
#                     return Response({'status': 'No data found for pool_id'}, status=status.HTTP_404_NOT_FOUND)
#             except Pair.DoesNotExist:
#                 return Response({'status': 'Invalid pool_id'}, status=status.HTTP_404_NOT_FOUND)
#         else:
#             pairs = Pair.objects.all().order_by("-id")
#             serializer = PairSerializer(pairs, many=True)
#             return Response({'status': 'success', 'data': serializer.data})

#     def post(self, request):
#         serializer = PairSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'status': 'success', 'data': serializer.data})
#         else:
#             return Response({'status': 'invalid data', 'errors': serializer.errors})

#     def patch(self, request, id=None):
#         if id:
#             try:
#                 pair = Pair.objects.get(id=id)
#             except Pair.DoesNotExist:
#                 return Response({'status': 'invalid id'})

#             serializer = PairSerializer(pair, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({'status': 'success', 'data': serializer.data})
#             else:
#                 return Response({'status': 'invalid data', 'errors': serializer.errors})
#         else:
#             return Response({'status': 'id required'})

#     def delete(self, request, id=None):
#         if id:
#             try:
#                 pair = Pair.objects.get(id=id)
#                 pair.delete()
#                 return Response({'status': 'Deleted data'})
#             except Pair.DoesNotExist:
#                 return Response({'status': 'invalid id'})
#         else:
#             return Response({'status': 'id required'})


#==============12/12/24===================


class Pair_view(APIView):
    
    def get(self, request, id=None, pool_id=None,player_id1=None,player_id2=None):
        # Case where both pool_id and id are provided in the URL
        if pool_id and id:
            try:
                # Filter by both pool_id and player_1 ID
                pair = Pair.objects.filter(pool_name__id=pool_id)
                if pair:
                    serializer = PairSerializer(pair)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'Invalid data', 'message': 'No data found for the specified player_1 in the given pool'}, status=status.HTTP_404_NOT_FOUND)
            except Pair.DoesNotExist:
                return Response({'status': 'Invalid data', 'message': 'Invalid pool_id or player_1 id'}, status=status.HTTP_404_NOT_FOUND)

        # Case where only id is provided in the URL
        elif id:
            try:
                # Filter by specific id
                pair = Pair.objects.get(id=id)
                serializer = PairSerializer(pair)
                return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
            except Pair.DoesNotExist:
                return Response({'status': 'Invalid id', 'message': 'No data found for the specified ID'}, status=status.HTTP_404_NOT_FOUND)

        elif player_id1 and player_id2:
            try:
                # Filter by specific id
                pair = Pair.objects.get(pool_name__id=pool_id,player_1__id=player_id1,player_2__id=player_id2)
                serializer = PairSerializer(pair)
                return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
            except Pair.DoesNotExist:
                return Response({'status': 'Invalid id', 'message': 'No data found for the specified ID'}, status=status.HTTP_404_NOT_FOUND)    

        # Case where only pool_id is provided in the URL
        elif pool_id:
            try:
                # Filter by pool_id
                pairs = Pair.objects.filter(pool_name__id=pool_id)
                if pairs.exists():
                    serializer = PairSerializer(pairs, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for pool_id', 'message': 'No pairs found for the given pool_id'}, status=status.HTTP_404_NOT_FOUND)
            except Pair.DoesNotExist:
                return Response({'status': 'Invalid pool_id', 'message': 'Invalid pool_id provided'}, status=status.HTTP_404_NOT_FOUND)

        # Case when neither id nor pool_id is provided
        else:
            # Return all pairs
            pairs = Pair.objects.all().order_by("-id")
            serializer = PairSerializer(pairs, many=True)
            return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
    
    
    def post(self, request):
        serializer = PairSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': 'invalid data', 'errors': serializer.errors})

    def patch(self, request, id=None,pool_id=None,player_id1=None,player_id2=None):
        if id:
            try:
                pair = Pair.objects.get(id=id)
            except Pair.DoesNotExist:
                return Response({'status': 'invalid id'})

            serializer = PairSerializer(pair, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'data': serializer.data})
            else:
                return Response({'status': 'invalid data', 'errors': serializer.errors})
        elif player_id1 and player_id2:
            try:
                pair = Pair.objects.get(pool_name__id=pool_id,player_1__id=player_id1,player_2__id=player_id2)
            except Pair.DoesNotExist:
                return Response({'status': 'invalid id'})

            serializer = PairSerializer(pair, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'data': serializer.data})
            else:
                return Response({'status': 'invalid data', 'errors': serializer.errors})    
        else:
            return Response({'status': 'id required'})

    def delete(self, request, id=None):
        if id:
            try:
                pair = Pair.objects.get(id=id)
                pair.delete()
                return Response({'status': 'Deleted data'})
            except Pair.DoesNotExist:
                return Response({'status': 'invalid id'})
        else:
            return Response({'status': 'id required'})









#---------------Pair with captain View----------------------
# pair_2
class Pair_with_captain_view(APIView):
    def get(self, request, id=None,pool_id=None,player_id1=None,player_id2=None):
        if id:
            try:
                pair = Pair_with_captain.objects.get(id=id)
                serializer = Pair_with_captain_Serializer(pair)
                return Response({'status': 'success', 'data': serializer.data})
            except Pair_with_captain.DoesNotExist:
                return Response({'status': 'Invalid id'})
        elif pool_id:
            try:
                print(pool_id)
                uid = Pair_with_captain.objects.filter(pool_name__id=pool_id)
                if uid.exists():
                    serializer = Pair_with_captain_Serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for pool_id'}, status=status.HTTP_404_NOT_FOUND)
            except Pair_with_captain.DoesNotExist:
                return Response({'status': 'Invalid pool_id'}, status=status.HTTP_404_NOT_FOUND)
        elif player_id1 and player_id2:
            try:
                # Filter by specific id
                pair = Pair_with_captain.objects.get(pool_name__id=pool_id,player_1__id=player_id1,player_2__id=player_id2)
                serializer = Pair_with_captain_Serializer(pair)
                return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
            except Pair_with_captain.DoesNotExist:
                return Response({'status': 'Invalid id', 'message': 'No data found for the specified ID'}, status=status.HTTP_404_NOT_FOUND)        
        else:
            pairs = Pair_with_captain.objects.all().order_by("-id")
            serializer = Pair_with_captain_Serializer(pairs, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = Pair_with_captain_Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': 'invalid data', 'errors': serializer.errors})

    def patch(self, request, id=None,pool_id=None,player_id1=None,player_id2=None):
        if id:
            try:
                pair = Pair_with_captain.objects.get(id=id)
            except Pair_with_captain.DoesNotExist:
                return Response({'status': 'invalid id'})

            serializer = Pair_with_captain_Serializer(pair, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'data': serializer.data})
            else:
                return Response({'status': 'invalid data', 'errors': serializer.errors})
                
        
        elif player_id1 and player_id2:
            try:
                pair = Pair_with_captain.objects.get(pool_name__id=pool_id,player_1__id=player_id1,player_2__id=player_id2)
            except Pair_with_captain.DoesNotExist:
                return Response({'status': 'invalid id'})

            serializer = Pair_with_captain_Serializer(pair, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'data': serializer.data})
            else:
                return Response({'status': 'invalid data', 'errors': serializer.errors})          
        
        else:
            return Response({'status': 'id required'})

    def delete(self, request, id=None):
        if id:
            try:
                pair = Pair_with_captain.objects.get(id=id)
                pair.delete()
                return Response({'status': 'Deleted data'})
            except Pair_with_captain.DoesNotExist:
                return Response({'status': 'invalid id'})
        else:
            return Response({'status': 'id required'})



#---------------Pair with captain and vice captain View----------------
# pair_3

class Pair_with_captain_v_captain_view(APIView):
    def get(self, request, id=None,pool_id=None,player_id1=None,player_id2=None,player_id3=None):
        if id:
            try:
                pair = Pair_with_captain_and_v_captain.objects.get(id=id)
                serializer = Pair_with_captain_and_v_captain_Serializer(pair)
                return Response({'status': 'success', 'data': serializer.data})
            except Pair_with_captain_and_v_captain.DoesNotExist:
                return Response({'status': 'Invalid id'})
        
        elif player_id1 and player_id2 and player_id3:
            try:
                # Filter by specific id
                pair = Pair_with_captain_and_v_captain.objects.get(pool_name__id=pool_id,player_1__id=player_id1,player_2__id=player_id2,player_3__id=player_id3)
                serializer = Pair_with_captain_and_v_captain_Serializer(pair)
                return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
            except Pair_with_captain_and_v_captain.DoesNotExist:
                return Response({'status': 'Invalid id', 'message': 'No data found for the specified ID'}, status=status.HTTP_404_NOT_FOUND)
        
        elif pool_id:
            try:
                print(pool_id)
                uid = Pair_with_captain_and_v_captain.objects.filter(pool_name__id=pool_id)
                if uid.exists():
                    serializer = Pair_with_captain_and_v_captain_Serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for pool_id'}, status=status.HTTP_404_NOT_FOUND)
            except Pair_with_captain_and_v_captain.DoesNotExist:
                return Response({'status': 'Invalid pool_id'}, status=status.HTTP_404_NOT_FOUND)
        else:
            pairs = Pair_with_captain_and_v_captain.objects.all().order_by("-id")
            serializer = Pair_with_captain_and_v_captain_Serializer(pairs, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = Pair_with_captain_and_v_captain_Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': 'invalid data', 'errors': serializer.errors})

    def patch(self, request, id=None,pool_id=None,player_id1=None,player_id2=None,player_id3=None):
        if id:
            try:
                pair = Pair_with_captain_and_v_captain.objects.get(id=id)
            except Pair_with_captain_and_v_captain.DoesNotExist:
                return Response({'status': 'invalid id'})

            serializer = Pair_with_captain_and_v_captain_Serializer(pair, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'data': serializer.data})
            else:
                return Response({'status': 'invalid data', 'errors': serializer.errors})
        
        elif player_id1 and player_id2 and player_id3:
            try:
                pair = Pair_with_captain_and_v_captain.objects.get(pool_name__id=pool_id,player_1__id=player_id1,player_2__id=player_id2,player_3__id=player_id3)
            except Pair_with_captain_and_v_captain.DoesNotExist:
                return Response({'status': 'invalid id'})

            serializer = Pair_with_captain_and_v_captain_Serializer(pair, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'data': serializer.data})
            else:
                return Response({'status': 'invalid data', 'errors': serializer.errors})   
        
        
        else:
            return Response({'status': 'id required'})

    def delete(self, request, id=None):
        if id:
            try:
                pair = Pair_with_captain_and_v_captain.objects.get(id=id)
                pair.delete()
                return Response({'status': 'Deleted data'})
            except Pair_with_captain_and_v_captain.DoesNotExist:
                return Response({'status': 'invalid id'})
        else:
            return Response({'status': 'id required'})




#======

class new_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=new.objects.get(id=id)
                serializer=new_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=new.objects.all().order_by("-id")
            serializer=new_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=new_serializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=new.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=new_serializers(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})





    def delete(self,request,id=None):
        if id:
            try:
                uid=new.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})





#==========Match Views==================



class match_view(APIView):
    def get(self, request, id=None):
        if id:
            try:
                uid = Match.objects.get(id=id)
                serializer = MatchSerializer(uid)
                return Response({'status': 'success', 'data': serializer.data})
            except Match.DoesNotExist:
                return Response({'status': "Invalid"})
        else:
            uid = Match.objects.all().order_by("-id")

            serializer = MatchSerializer(uid, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = MatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def patch(self, request, id=None):
        try:
            uid = Match.objects.get(id=id)
        except Match.DoesNotExist:
            return Response({'status': "invalid data"})

        serializer = MatchSerializer(uid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def delete(self, request, id=None):
        if id:
            try:
                uid = Match.objects.get(id=id)
                uid.delete()
                return Response({'status': 'Deleted data'})
            except Match.DoesNotExist:
                return Response({'status': "invalid id"})
        else:
            return Response({'status': "invalid data"})


#=============  Add_pool views  =======================
class Add_pool_view(APIView):
    def get(self, request, id=None,match_id=None):
    #     if id:
    #         try:
    #             uid = Add_Pool.objects.get(id=id)
    #             serializer = AddPoolSerializer(uid)
    #             return Response({'status': 'success', 'data': serializer.data})
    #         except Add_Pool.DoesNotExist:
    #             return Response({'status': "Invalid"})
    #     else:
    #         uid = Add_Pool.objects.all().order_by("-id")
    #         serializer = AddPoolSerializer(uid, many=True)
    #         return Response({'status': 'success', 'data': serializer.data})
        if id:
            try:
                uid = Add_Pool.objects.get(id=id)
                serializer = AddPoolSerializer(uid)
                return Response({'status': 'success', 'data': serializer.data})
            except Add_Pool.DoesNotExist:
                return Response({'status': "Invalid"})
        elif match_id:
            try:
                print(match_id)
                uid = Add_Pool.objects.filter(select_match__id=match_id)
                if uid.exists():
                    serializer = AddPoolSerializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for match_id'}, status=status.HTTP_404_NOT_FOUND)
            except Add_Pool.DoesNotExist:
                return Response({'status': 'Invalid match_id'}, status=status.HTTP_404_NOT_FOUND)
        else:
            uid = Add_Pool.objects.all().order_by("-id")
            serializer = AddPoolSerializer(uid, many=True)
            return Response({'status': 'success', 'data': serializer.data})


    def post(self, request):
        serializer = AddPoolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def patch(self, request, id=None):
        try:
            uid = Add_Pool.objects.get(id=id)
        except Add_Pool.DoesNotExist:
            return Response({'status': "invalid data"})

        serializer = AddPoolSerializer(uid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def delete(self, request, id=None):
        if id:
            try:
                uid = Add_Pool.objects.get(id=id)
                uid.delete()
                return Response({'status': 'Deleted data'})
            except Add_Pool.DoesNotExist:
                return Response({'status': "invalid id"})
        else:
            return Response({'status': "invalid data"})

#======================  Captain Add Pool View ==========================
class Captain_Add_Pool_view(APIView):
    def get(self, request, id=None):
        if id:
            try:
                uid = Captain_Add_Pool.objects.get(id=id)
                serializer = Captain_Add_PoolSerializer(uid)
                return Response({'status': 'success', 'data': serializer.data})
            except Match.DoesNotExist:
                return Response({'status': "Invalid"})
        else:
            uid = Captain_Add_Pool.objects.all().order_by("-id")
            serializer = Captain_Add_PoolSerializer(uid, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = Captain_Add_PoolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def patch(self, request, id=None):
        try:
            uid = Captain_Add_Pool.objects.get(id=id)
        except Captain_Add_Pool.DoesNotExist:
            return Response({'status': "invalid data"})

        serializer = Captain_Add_PoolSerializer(uid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def delete(self, request, id=None):
        if id:
            try:
                uid = Captain_Add_Pool.objects.get(id=id)
                uid.delete()
                return Response({'status': 'Deleted data'})
            except Captain_Add_Pool.DoesNotExist:
                return Response({'status': "invalid id"})
        else:
            return Response({'status': "invalid data"})


#========================Vice Captain Add Pool View==========================
class Vice_Captain_Add_Pool_view(APIView):
    def get(self, request, id=None):
        if id:
            try:
                uid = Vice_Captain_Add_Pool.objects.get(id=id)
                serializer = Vice_Captain_Add_PoolSerializer(uid)
                return Response({'status': 'success', 'data': serializer.data})
            except Match.DoesNotExist:
                return Response({'status': "Invalid"})
        else:
            uid = Vice_Captain_Add_Pool.objects.all().order_by("-id")
            serializer = Vice_Captain_Add_PoolSerializer(uid, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = Vice_Captain_Add_PoolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def patch(self, request, id=None):
        try:
            uid = Vice_Captain_Add_Pool.objects.get(id=id)
        except Vice_Captain_Add_Pool.DoesNotExist:
            return Response({'status': "invalid data"})

        serializer = Vice_Captain_Add_PoolSerializer(uid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def delete(self, request, id=None):
        if id:
            try:
                uid = Vice_Captain_Add_Pool.objects.get(id=id)
                uid.delete()
                return Response({'status': 'Deleted data'})
            except Vice_Captain_Add_Pool.DoesNotExist:
                return Response({'status': "invalid id"})
        else:
            return Response({'status': "invalid data"})




#===========Pool declare views------------------
class Pool_Declare_view(APIView):
    def get(self, request, id=None, match_id=None):
        if id:
            try:
                uid = Pool_Declare.objects.get(id=id)
                serializer = Pool_Declare_Serializer(uid)
                return Response({'status': 'success', 'data': serializer.data})
            except Match.DoesNotExist:
                return Response({'status': "Invalid"})
        
        elif match_id:
            try:
                print(match_id)
                uid = Pool_Declare.objects.filter(select_match__id=match_id).order_by('-id')[:1]
                if uid.exists():
                    serializer = Pool_Declare_Serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for match_id'}, status=status.HTTP_404_NOT_FOUND)
            except Pool_Declare.DoesNotExist:
                return Response({'status': 'Invalid match_id'}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            uid = Pool_Declare.objects.all().order_by("-id")
            serializer = Pool_Declare_Serializer(uid, many=True)
            return Response({'status': 'success', 'data': serializer.data})

    def post(self, request):
        serializer = Pool_Declare_Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def patch(self, request, id=None):
        try:
            uid = Pool_Declare.objects.get(id=id)
        except Pool_Declare.DoesNotExist:
            return Response({'status': "invalid data"})

        serializer = Pool_Declare_Serializer(uid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'data': serializer.data})
        else:
            return Response({'status': "invalid data", 'errors': serializer.errors})

    def delete(self, request, id=None):
        if id:
            try:
                uid = Pool_Declare.objects.get(id=id)
                uid.delete()
                return Response({'status': 'Deleted data'})
            except Pool_Declare_Serializer.DoesNotExist:
                return Response({'status': "invalid id"})
        else:
            return Response({'status': "invalid data"})




class user_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=user.objects.get(user_id=id)
                serializer=user_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=user.objects.all().order_by("-id")
            for i in uid:
                print(i.date_time)
            serializer=user_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=user_serializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data","error":serializer.errors})


    def patch(self,request,id=None):
        try:
            uid=user.objects.get(user_id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=user_serializers(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data","error":serializer.errors})





    def delete(self,request,id=None):
        if id:
            try:
                uid=user.objects.get(user_id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})

#================================login_view=====================================
class login_view(APIView):
    def get(self,request,id=None , email=None):

        if id:

            try:
                uid=login_user.objects.get(id=id)
                serializer=login_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        elif email:

            try:
                uid=login_user.objects.get(email=email)
                serializer=login_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=login_user.objects.all().order_by("-id")
            serializer=login_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
            serializer=login_serializers(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data.get('email')
                password = serializer.validated_data.get('password')

                uid=login_user.objects.filter(email=email).exists()
                if uid:
                    uid=login_user.objects.get(email=email)
                    if uid.password == password:
                        serializer=LoginSerializer(uid)

                        return Response({'status':'success','data':serializer.data})
                    else:
                        return Response({'status':'invalid password'})
                else:
                    return Response({'status':'invalid email'})




            else:
                return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=login_user.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=login_serializers(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})
    def delete(self,request,id=None,email=None):
        if id:
            try:
                uid=login_user.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        elif email:
            del request.session['email']
            return Response({'status': 'Logged out successfully'})

        else:
            return Response({'status':"invalid data"})
    def logout(self, request):
        try:
            del request.session['email']
        except KeyError:
            pass
        return Response({'status': 'Logged out successfully'})


#===============user_pool_history_view=====================



class user_pool_history_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=user_pool_history.objects.get(id=id)
                serializer=UserPoolHistorySerializer(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=user_pool_history.objects.all().order_by("-id")

            serializer=UserPoolHistorySerializer(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=UserPoolHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=user_pool_history.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=UserPoolHistorySerializer(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})





    def delete(self,request,id=None):
        if id:
            try:
                uid=user_pool_history.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})



#===============view_contest_details_view=====================



class view_contest_details_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=view_contest_details.objects.get(id=id)
                serializer=view_contest_details_Serializer(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=view_contest_details.objects.all().order_by("-id")

            serializer=view_contest_details_Serializer(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=view_contest_details_Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})


    def patch(self,request,id=None):
        try:
            uid=view_contest_details.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=view_contest_details_Serializer(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})





    def delete(self,request,id=None):
        if id:
            try:
                uid=view_contest_details.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})


# ======================== all  match  ==============================



class all_match_view(APIView):
    def get(self,request,id=None,user_id=None,match_id=None,pool_id=None):
        if id:

            try:
                uid=all_match_details.objects.get(id=id)
                serializer=all_match_serializer(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
                
        elif user_id and match_id and pool_id:
            try:
                match_detail = all_match_details.objects.filter(user_data__user_id=user_id, match__id=match_id,pool_id=pool_id)
                if match_detail:
                    serializer = all_match_serializer(match_detail,many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for user_id and match_id and pool_id'}, status=status.HTTP_404_NOT_FOUND)
            except all_match_details.DoesNotExist:
                return Response({'status': 'Invalid user_id or match_id and pool_id'}, status=status.HTTP_404_NOT_FOUND)               
        elif user_id and match_id:
            try:
                match_detail = all_match_details.objects.filter(user_data__user_id=user_id, match__id=match_id)
                if match_detail:
                    serializer = all_match_serializer(match_detail,many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for user_id and match_id'}, status=status.HTTP_404_NOT_FOUND)
            except all_match_details.DoesNotExist:
                return Response({'status': 'Invalid user_id or match_id'}, status=status.HTTP_404_NOT_FOUND)
         
            
        elif user_id:
            try:
                print(user_id)
                uid = all_match_details.objects.filter(user_data__user_id=user_id)
                if uid.exists():
                    serializer = all_match_serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for user_id'}, status=status.HTTP_404_NOT_FOUND)
            except all_match_details.DoesNotExist:
                return Response({'status': 'Invalid user_id'}, status=status.HTTP_404_NOT_FOUND)
                
        
        elif match_id:
            try:
                print(match_id)
                uid = all_match_details.objects.filter(match__id=match_id)
                if uid.exists():
                    serializer = all_match_serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for match_id'}, status=status.HTTP_404_NOT_FOUND)
            except all_match_details.DoesNotExist:
                return Response({'status': 'Invalid match_id'}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            uid=all_match_details.objects.all().order_by("-id")
            serializer=all_match_serializer(uid,many=True)
            return Response({'status':'success','data':serializer.data})
        

    def post(self,request):
        serializer=all_match_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data","error":serializer.errors})

    def patch(self,request,id=None,user_id=None,match_id=None):
        if id:
            try:
                uid=all_match_details.objects.get(id=id)
            except:
                return Response({'status':"invalid data"})
            serializer=all_match_serializer(uid,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status':'success','data':serializer.data})
            else:
                return Response({'status':"invalid data","error":serializer.errors})
        elif user_id and match_id:
            try:
                match_detail = all_match_details.objects.get(user_data__user_id=user_id, id=match_id)
                serializer = all_match_serializer(match_detail, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'invalid data', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            except all_match_details.DoesNotExist:
                return Response({'status': 'No match found for the given user_id and match_id'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self,request,id=None):
        if id:
            try:
                uid=all_match_details.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})






#================payment=======

from django.db.models import Sum

class AddAmountView(APIView):
    def post(self, request):
        serializer = AddAmountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return redirect('admin_wallet') 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def get(self, request):
    #     total_amount = Add_Amount.objects.aggregate(total=Sum('add_amount'))['total'] or 0
    #     context = {'total': total_amount}
    #     if request.accepted_renderer.format == 'html':
    #         return render(request, "add_amount.html", context)
    #     return Response(context, status=status.HTTP_200_OK)
    
    
    def patch(self,request,id=None):
        try:
            uid=Add_Amount.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=AddAmountSerializer(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data"})
    def get(self,request,id=None):  
        if id:
        
            try:
                uid=Add_Amount.objects.get(id=id)
                serializer=AddAmountSerializer(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=Add_Amount.objects.all().order_by("-id")
            
            serializer=AddAmountSerializer(uid,many=True)
            return Response({'status':'success','data':serializer.data})

class PayView(APIView):
    def get(self, request):
        last_add_amount = Add_Amount.objects.last()
        if not last_add_amount:
            return Response({'detail': 'No amounts found'}, status=status.HTTP_404_NOT_FOUND)

        amount = last_add_amount.add_amount * 100
        client = razorpay.Client(auth=('rzp_test_bilBagOBVTi4lE', '77yKq3N9Wul97JVQcjtIVB5z'))
        response = client.order.create({
            'amount': amount,
            'currency': 'INR',
            'payment_capture': 1
        })
        context = {
            'response': response,
            'total': last_add_amount.add_amount,
        }
        if request.accepted_renderer.format == 'html':
            return render(request, "pay.html", context)
        return Response(context, status=status.HTTP_200_OK)



#==================wallet_view=====================
class wallet_view(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = Wallet.objects.get(Player_ID=id)
                serializer = Wallet_serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = Wallet.objects.all()
            serializer = Wallet_serializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        serializer = Wallet_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = Wallet.objects.get(Player_ID=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = Wallet_serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = Wallet.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})



#==================wallet_transaction--------------
class wallet_transaction(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = Wallet_transactions.objects.get(id=id)
                serializer = Wallet_transactions_serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = Wallet_transactions.objects.all()
            serializer = Wallet_transactions_serializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        serializer = Wallet_transactions_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = Wallet_transactions.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = Wallet_transactions_serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = Wallet_transactions.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})


#=================all_transaction===================
class all_transaction(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = All_Transcrion.objects.get(id=id)
                serializer = All_Transcrion_serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = All_Transcrion.objects.all()
            serializer = All_Transcrion_serializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        serializer = All_Transcrion_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = All_Transcrion.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = All_Transcrion_serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = All_Transcrion.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})


#-----------------------withdraw_history---------




class withdraw_history(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = Withdraw_history.objects.get(id=id)
                serializer = Withdraw_history_serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = Withdraw_history.objects.all().order_by("-id")
            serializer = Withdraw_history_serializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        serializer = Withdraw_history_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = Withdraw_history.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = Withdraw_history_serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = Withdraw_history.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})




#===============================game_amount_view========================
class game_amount_view(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = game_amount.objects.get(id=id)
                serializer = game_amount_serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = game_amount.objects.order_by("-id")
            serializer = game_amount_serializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        serializer = game_amount_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = game_amount.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = game_amount_serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = game_amount.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})



#+===========================================
class user_store_team_get_view(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = User_store_team.objects.get(id=id)
                serializer = UserStoreTeamSerializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = User_store_team.objects.order_by("-id")
            serializer = UserStoreTeamSerializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        serializer = UserStoreTeamSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = User_store_team.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = UserStoreTeamSerializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = User_store_team.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})



#===================================================================
class send_otp_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=send_otp.objects.get(phone_number=id)
                serializer=send_otp_serializers(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=send_otp.objects.all().order_by("-id")
            serializer=send_otp_serializers(uid,many=True)
            return Response({'status':'success','data':serializer.data})






# ======================================== ad =========================


class ad_view(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = ad.objects.get(id=id)
                serializer = ad_serializers(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = ad.objects.order_by("-id")
            serializer = ad_serializers(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        # pid=ad.objects.all()
        # pid.delete()
        serializer = ad_serializers(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})



    def patch(self,request,id=None):

        if id:
            uid = ad.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = ad_serializers(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = ad.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                   return Response({'status' : "invalid data..."})



class ad_view1(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = Ad1.objects.get(id=id)
                serializer = AdSerializer1(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = Ad1.objects.order_by("-id")
            serializer = AdSerializer1(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        # pid=Ad1.objects.all()
        # pid.delete()
        serializer = AdSerializer1(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})



    def patch(self,request,id=None):

        if id:
            uid = Ad1.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = AdSerializer1(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data..."})


    def delete(self,request,id=None):
        if id:
            try:
                uid = Ad1.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                   return Response({'status' : "invalid data..."})


#======================================================================
class Scrach_coupon_view(APIView):
    def get(self,request,id=None):
        if id:

            try:
                uid=Scrach_coupon.objects.get(id=id)
                serializer=ScrachCouponSerializer(uid)
                return Response({'status':'success','data':serializer.data})
            except:
                return Response({'status':"Invalid"})
        else:
            uid=Scrach_coupon.objects.all().order_by("-id")
            serializer=ScrachCouponSerializer(uid,many=True)
            return Response({'status':'success','data':serializer.data})

    def post(self,request):
        serializer=ScrachCouponSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data","error":serializer.errors})


    def patch(self,request,id=None):
        try:
            uid=Scrach_coupon.objects.get(id=id)
        except:
            return Response({'status':"invalid data"})
        serializer=ScrachCouponSerializer(uid,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status':'success','data':serializer.data})
        else:
            return Response({'status':"invalid data","error":serializer.errors})





    def delete(self,request,id=None):
        if id:
            try:
                uid=Scrach_coupon.objects.get(id=id)
                uid.delete()
                return Response({'status':'Deleted data'})
            except:
                return Response({'status':"invalid id"})
        else:
            return Response({'status':"invalid data"})


# ================== notification ====================



class notification_view(APIView):

    def get(self,request,id=None,user_id=None):

        if id:
            try:
                uid = notification.objects.get(id=id)
                serializer = NotificationSerializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})
        elif user_id:
            try:
                print(user_id)
                uid = notification.objects.filter(user_data__user_id=user_id)
                if uid.exists():
                    serializer = NotificationSerializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data})
                else:
                    return Response({'status': 'No data found for user_id'})
            except notification.DoesNotExist:
                return Response({'status': 'Invalid user_id'})
        
        else:
            uid = notification.objects.order_by("-id")
            serializer = NotificationSerializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        # pid=Ad1.objects.all()
        # pid.delete()
        serializer = NotificationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})



    def patch(self,request,id=None):

        if id:
            uid = notification.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = NotificationSerializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})


    def delete(self,request,id=None):
        if id:
            try:
                uid = notification.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                   return Response({'status' : "invalid data..."})


# ================== Referral ====================



class referral_view(APIView):

    def get(self,request,id=None):

        if id:
            try:
                uid = referral.objects.get(id=id)
                serializer = ReferralSerializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        else:
            uid = referral.objects.order_by("-id")
            serializer = ReferralSerializer(uid,many=True)
            # uid1=user.objects.get(user_id= "123123aaanileshjadav")
            # print(uid1)
            # for i in uid1.referral_set.all():
            #     print("ok")

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        # pid=Ad1.objects.all()
        # pid.delete()
        serializer = ReferralSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})



    def patch(self,request,id=None):

        if id:
            uid = referral.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = ReferralSerializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})


    def delete(self,request,id=None):
        if id:
            try:
                uid = referral.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                   return Response({'status' : "invalid data..."})



#==========================================================================

import firebase_admin # type: ignore
from firebase_admin import credentials, messaging # type: ignore
from rest_framework.decorators import api_view


# cred = credentials.Certificate('/home/Krinik/myproject/krinik.json')  # Update this path as needed
# cred = credentials.Certificate('/home/Krinik/myproject/credentials/krinik.json')
# firebase_admin.initialize_app(cred)



firebase_credentials_json = '''{
    "type": "service_account",
    "project_id": "krinkin-309ee",
    "private_key_id": "912e7ff3ada2778baa622d401b8ae17197df98e6",
    "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHeDRLX25kTSar\\n4y6QscDeqIyGmIMMjx7RbgAPhY8mOfN68FYHxwlH2nuMXKR3onMLC1ygIPiRWWjY\\nM/hYVaISYv2IsTZcXKMjkrXYhMDKj8r8lRaYVx4DkeT9onQjD9ZbK9dHVG8IaGyt\\nhBI3shf3F0xkKyZqy0UGtjixrVu5Gsj3VbyxCR5ePKfi0f2eTkn2mE/XX/9C2HI2\\n9bX8wnVyH5jZuAgsSxCeyRZD6I7Qb5q7QHy4FxsL+965DqzpiAMkfsNX3+OlMEPH\\np60Hi47OLp3/CWblzaEuruwKb95sBZTlPT8dysyKUFf8kjnBzZPeeGbbMQ/uQLv0\\nYHExgVdbAgMBAAECggEACv5ZA35y+xw1cWvH+TmSw7LOa+yj7GFG9Yv2fOSDizvO\\na4wrcapKnKcx//5rIhzV8lnh9QFcMcaXvLLAkT3G/PRvvMTnlheU9jTzyMcoSQG7\\n0kf1QtgqU1ALKt91Pyl0SvoTl17T78axlq6cwm0SXQ/vqeWm7GPfngsU/NXtJDp4\\ntDSXXO0+Ks2HOLroJor92fX4YAvTEGHTVeOphflWl15s9A6gYvLXJ4fE/knwQLrU\\nk8dlTuiSBQmw+GDjWcTDtCW2WFAQLtXJJguxDVn1DJuO7Slst9R/BPJPWfaJd/fr\\nCte5P/PUW0Qa3s/4Zo0XKc3lyXqzI54ImOgXShH6wQKBgQD0qAX0iy1XYxTb96Vp\\nAbxgOR5X0hIcpZM7ZSaCNB7LHxp3rasvO2KEIWcGPUluHm9kEv0Gt1F+qtM/L6uY\\nRkBERbMBAMPJ2xE2jXbzdu0UArvn1KACF8DTXurhYDM5+16lN5AW0Dwbe1+Ak4If\\nItipJ0iub9lFszLWHxXERSnSIwKBgQDQt9TGDkj9IFDCr8WbmKlqYaKgj1q0rDuY\\nXRQiX9NAz/ih/QTgxHQqOx7WC8zf3kquZIJSHmf9gX+D4/mjVU9LtHRDwYjt7Nop\\nltXJFV30hIe5O64moSvJdPOmANqXgUfAI2qHTFjOChat0A4s3qNuVnAajeU2XP25\\nHYkIDo4taQKBgGXzdrfXH4fg5Bpd8nH1pTg71ScnhSCm5tnDZu6vJX3jcjYZCtLd\\n3knNWY9CDs1ypVyAhSw9TBqKuQkFpm4IKFPK77MlTHFbdqrS/JSsJFNIaGFNO3hj\\nyZjLXvmYCwDIfUJACy1WjRWurbd4wKqU7NBgbGs0dMgUysRro7hsUecdAoGAJcy1\\nNy1NILKija/BrP1H6WFHT6bGuaPboytwQw1xt/IySDwHjyFlHGTan89BSmX6xnyj\\ncXXaRXoXeu5lvqPrmX1T9RVu1BAqLpAHpcQ94NPDtNNPJeXYhUKuAalz7S5XrT98\\nwoYcKyx+kPn2J0Am/wuef+Ck22SZ+tWThKcGLskCgYEA5c4OWLldh+RJtDy5RPn4\\n5Rxn1cRBngckqJYmGTdG8VawafFYNir0ABVU2NWz2GoUScJ+oClUn4YnIHOab4gi\\nfjjagArTkWAL7hE8fd7aQn4SLqa39BwPLOXpIt2cSk5RMd/ZaAvQRGbho4jYCFXO\\nfIhQRY0GytCHVFWHQC+F2Ng=\\n-----END PRIVATE KEY-----\\n",
    "client_email": "firebase-adminsdk-7l52f@krinkin-309ee.iam.gserviceaccount.com",
    "client_id": "107685784142700050654",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7l52f%40krinkin-309ee.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}'''
# Initialize the Firebase Admin SDK
cred = credentials.Certificate(json.loads(firebase_credentials_json))
firebase_admin.initialize_app(cred)




@api_view(['POST'])
def send_notification(request):
    tokens = request.data.get('tokens')
    title = request.data.get('title')
    body = request.data.get('body')


    messages = [
        messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=token,
        ) for token in tokens
    ]

    # Send messages
    responses = []
    for message in messages:
        try:
            response = messaging.send(message)
            responses.append({"success": True, "response": response})
        except Exception as e:
            responses.append({"success": False, "error": str(e)})
    # print(response)
    return JsonResponse(responses, safe=False)
    
    
# ==================



#==============================
class Withdraw_amount_views(APIView):
    
    def get(self,request,id=None,user_id=None):
        
        if id:
            try:
                uid = Withdraw_amount.objects.get(id=id)
                serializer = Withdraw_amount_Serializer(uid)
                
                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})
        elif user_id:
            try:
                print(user_id)
                uid = Withdraw_amount.objects.filter(user_data__user_id=user_id).order_by("-id")
                if uid.exists():
                    serializer = Withdraw_amount_Serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for user_id'}, status=status.HTTP_404_NOT_FOUND)    
            except Withdraw_amount.DoesNotExist:
                return Response({'status': 'Invalid user_id'}, status=status.HTTP_404_NOT_FOUND)
    
                
        else:
            uid = Withdraw_amount.objects.all().order_by("-id")
            serializer = Withdraw_amount_Serializer(uid,many=True)
            
            return Response({'status' : "success",'data' : serializer.data})
        
    def post(self,request):
        serializer = Withdraw_amount_Serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            
            return Response({'status':'success','data' : serializer.data})
        else:
            return Response(serializer.errors)
            
            
    
    def patch(self,request,id=None,user_id=None):
        
        if id:
            try:
                uid = Withdraw_amount.objects.get(id=id)
                serializer = Withdraw_amount_Serializer(uid,data=request.data,partial=True)
                
                if serializer.is_valid():
                    serializer.save()
                    
                    return Response({'status':'success','data' : serializer.data})
                else:
                    return Response(serializer.errors)
            except:
                return Response({'status' : 'error','error':serializer.errors})
        elif  user_id and id:
            try:
                uid = Withdraw_amount.objects.get(user_data__user_id=user_id,id=id)
                serializer = Withdraw_amount_Serializer(uid,data=request.data,partial=True)
                
                if serializer.is_valid():
                    serializer.save()
                    
                    return Response({'status':'success','data' : serializer.data})
                else:
                    return Response(serializer.errors)
            except:
                return Response({'status' : 'error','error':serializer.errors})
                  
             
        
    
    def delete(self,request,id=None):
        if id:
            try:
                uid = Withdraw_amount.objects.get(id=id).delete()
               
                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                return Response({'status' : "invalid data..."})






# ===========================  user query ============================
        
class user_query_view(APIView):

    # def get(self,request,id=None,user_id=None):

    #     if id:
    #         try:
    #             uid = user_query.objects.get(user_data__user_id=id)
    #             serializer = User_Query_Serializer(uid)

    #             return Response({'status' : 'success','data':serializer.data})
    #         except:
    #             return Response({'status' : "invalid data..."})

    #     else:
    #         uid = user_query.objects.order_by("-id")
    #         serializer = User_Query_Serializer(uid,many=True)

    #         return Response({'status' : "success",'data' : serializer.data})
    
    
    
    
    
    def get(self,request,id=None,user_id=None):

        if id:
            try:
                uid = user_query.objects.get(id=id)
                serializer = User_Query_Serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})
        elif user_id:
            try:
                print(user_id)
                uid = user_query.objects.filter(user_data__user_id=user_id).order_by("-id")
                if uid.exists():
                    serializer = User_Query_Serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for user_id'}, status=status.HTTP_404_NOT_FOUND)    
            except user_query.DoesNotExist:
                return Response({'status': 'Invalid user_id'}, status=status.HTTP_404_NOT_FOUND)
        else:
            uid = user_query.objects.order_by("-id")
            serializer = User_Query_Serializer(uid,many=True)

            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        # pid=Ad1.objects.all()
        # pid.delete()
        serializer = User_Query_Serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})



    def patch(self,request,user_id=None):

        if id:
            uid = user_query.objects.get(user_data__user_id=user_id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = User_Query_Serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})


    def delete(self,request,id=None):
        if id:
            try:
                uid = user_query.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                   return Response({'status' : "invalid data..."})      
                   




#=================payment_view============

class payment_view(APIView):

    def get(self,request,id=None,user_id=None):

        if id:
            try:
                uid = payment.objects.get(id=id)
                serializer = payment_Serializer(uid)

                return Response({'status' : 'success','data':serializer.data})
            except:
                return Response({'status' : "invalid data..."})

        elif user_id:
            try:
                print(user_id)
                uid = payment.objects.filter(user_data__user_id=user_id).order_by("-id")
                if uid.exists():
                    serializer = payment_Serializer(uid, many=True)
                    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'No data found for user_id'}, status=status.HTTP_404_NOT_FOUND)    
            except payment.DoesNotExist:
                return Response({'status': 'Invalid user_id'}, status=status.HTTP_404_NOT_FOUND)
    
        else:
            uid = payment.objects.order_by("-id")
            serializer = payment_Serializer(uid,many=True)
            return Response({'status' : "success",'data' : serializer.data})

    def post(self,request):
        # pid=Ad1.objects.all()
        # pid.delete()
        serializer = payment_Serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})



    def patch(self,request,id=None):

        if id:
            uid = payment.objects.get(id=id)

        else:
            return Response({'status' : 'success','data':serializer.data})

        serializer = payment_Serializer(uid,data=request.data,partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({'status':'success','data' : serializer.data})
        else:
            return Response({'status' : "invalid data...","errors":serializer.errors})


    def delete(self,request,id=None):
        if id:
            try:
                uid = payment.objects.get(id=id).delete()

                return Response({'status' : 'success'})
            except:
                return Response({'status' : "invalid data..."})
        else:
                   return Response({'status' : "invalid data..."})        

         
         
 
