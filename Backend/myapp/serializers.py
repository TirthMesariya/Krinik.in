from rest_framework import serializers
from .models import*
from django.db.models import Q
import uuid

from django.core.exceptions import ObjectDoesNotExist

#-------------League_serializers view----------------

class League_serializers(serializers.Serializer):
    # id=serializers.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
    id = serializers.IntegerField(required=False)
    league_name=serializers.CharField(max_length=50,required=True)
    short_league_name=serializers.CharField(max_length=50,required=True)
    start_league_date=serializers.CharField(max_length=50,required=True)
    end_league_date=serializers.CharField(max_length=50,required=True)
    league_image=serializers.ImageField(required=True)

    class Meta:
        models=League
        fields ='__all__'
        exclude = ('id',)

    def create(self, validated_data):
        return League.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.league_name=validated_data.get('league_name',instance.league_name)

        instance.short_league_name=validated_data.get('short_league_name',instance.short_league_name)

        instance.start_league_date=validated_data.get('start_league_date',instance.start_league_date)
        instance.end_league_date=validated_data.get('end_league_date',instance.end_league_date)

        instance.league_image=validated_data.get('league_image',instance.league_image)

        instance.save()
        return instance




#-------------Team_serializers view----------------



class Team_serializers(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    league_name = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=True)
    team_name = serializers.CharField(max_length=100, required=True)
    team_short_name=serializers.CharField(max_length=50,required=True)
    team_image=serializers.ImageField(required=True)
    team_date=serializers.DateField(read_only=True,required=False)
    class Meta:
        model = Team
        fields = '__all__'
        exclude = ('id',)


    def create(self, validated_data):
        return Team.objects.create(**validated_data)


    def update(self, instance, validated_data):
        instance.league_name=validated_data.get('league_name',instance.league_name)
        instance.team_name=validated_data.get('team_name',instance.team_name)
        instance.team_short_name=validated_data.get('team_short_name',instance.team_short_name)
        instance.team_image=validated_data.get('team_image',instance.team_image)
        instance.team_date=validated_data.get('team_date',instance.team_date)

        instance.save()
        return instance



#-------------Player_serializers view----------------

class Player_serializers(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    league_name = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=True)
    team_name = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.none(), required=True)
   

    def __init__(self, *args, **kwargs):
        super(Player_serializers, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('league_name')

            if league_name:
                # Filter team_name queryset based on the league_name provided in the input data
                self.fields['team_name'].queryset = Team.objects.filter(league_name__league_name=league_name)

    player_name = serializers.CharField(max_length=100)
    player_short_name=serializers.CharField(max_length=50)
    player_image=serializers.ImageField(required=True)
    total_run=serializers.IntegerField(required=False)
    run=serializers.IntegerField(required=False)
    
    class Meta:
        model = Player
        fields = '__all__'
        exclude = ('id',)



    def create(self, validated_data):
        return Player.objects.create(**validated_data)



    def update(self, instance, validated_data):
        instance.league_name=validated_data.get('league_name',instance.league_name)
        instance.team_name=validated_data.get('team_name',instance.team_name)
        instance.player_name=validated_data.get('player_name',instance.player_name)
        instance.player_short_name=validated_data.get('player_short_name',instance.player_short_name)
        instance.player_image=validated_data.get('player_image',instance.player_image)
        instance.total_run=validated_data.get('total_run',instance.total_run)
        instance.run=validated_data.get('run',instance.run)

        instance.save()
        return instance
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["team_name"] = Team_serializers(instance.team_name).data
        return representation



#-------------Pool_serializers view----------------



class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["team_name",'player_name','player_image',"player_short_name","total_run",'run']

class Teamserializers(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id','team_name','team_short_name','team_image']


class Leagueserializers(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = ['league_name','short_league_name','league_image','start_league_date','end_league_date']
        # fields="__all__"



class PoolSerializer(serializers.ModelSerializer):
    player_name1 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True)
    player_name2 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True)
    team_name1 = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all())
    team_name2 = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all())
    start_pool_date=serializers.CharField(max_length=50,required=True)
    end_pool_date=serializers.CharField(max_length=50,required=True)

    league_data = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all())

    class Meta:
        model = Pool
        fields = ['id', 'pool_type', 'pool_name', 'entry_fee','league_data', 'team_name1', 'player_name1', 'team_name2', 'player_name2','start_pool_date','end_pool_date']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["player_name1"] = PlayerSerializer(instance.player_name1, many=True).data
        representation["player_name2"] = PlayerSerializer(instance.player_name2, many=True).data
        representation["league_data"] = Leagueserializers(instance.league_data).data
        representation["team_name1"] = Teamserializers(instance.team_name1).data
        representation["team_name2"] = Teamserializers(instance.team_name2).data

        return representation

    def update(self, instance, validated_data):
        instance.pool_type = validated_data.get('pool_type', instance.pool_type)
        instance.pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.entry_fee = validated_data.get('entry_fee', instance.entry_fee)
        instance.team_name1 = validated_data.get('team_name1', instance.team_name1)
        instance.team_name2 = validated_data.get('team_name2', instance.team_name2)
        instance.league_data = validated_data.get('league_data', instance.league_data)
        instance.start_pool_date = validated_data.get('start_pool_date', instance.start_pool_date)
        instance.end_pool_date = validated_data.get('end_pool_date', instance.end_pool_date)
        player_name1_data = validated_data.pop('player_name1', [])
        player_name2_data = validated_data.pop('player_name2', [])



        instance.player_name1.set(
            Player.objects.filter(player_name__in=[player.player_name for player in player_name1_data])
        )
        instance.player_name2.set(
            Player.objects.filter(player_name__in=[player.player_name for player in player_name2_data])
        )



        instance.save()
        return instance



#===============Pair serializers====================
# pair_1
class AddPool_Serializer(serializers.ModelSerializer):
    class Meta:                                 #show pool data in pair
        model = Add_Pool
        fields = ['id','pool_type', 'pool_name', 'price', 'winning_price', 'fantacy_start_date', 'fantacy_end_date']


# ===================== pair data store in players list formate ================


# class PairSerializer(serializers.ModelSerializer):
#     player_1 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all())
#     player_2 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all())
#     pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
#     select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.none(), allow_null=True, required=False)
#     limit = serializers.IntegerField()
#     def __init__(self, *args, **kwargs):
#         super(PairSerializer, self).__init__(*args, **kwargs)

#         if 'data' in kwargs:
#             data = kwargs['data']
#             league_name = data.get('pool_name')
#             match_display_name = data.get('select_match')

#             if league_name:
#                 # Filter pool_name queryset based on the league_name provided in the input data
#                 self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,select_match__match_display_name=match_display_name)

#             if match_display_name:
#                 # Filter select_match queryset based on the match_display_name provided in the input data
#                 self.fields['select_match'].queryset = Match.objects.filter(match_display_name=match_display_name)



#     class Meta:
#         model = Pair
#         fields = ['id', 'pool_name','select_match', 'player_1', 'player_2', 'limit']

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation["player_1"] = PlayerSerializer(instance.player_1).data
#         representation["player_2"] = PlayerSerializer(instance.player_2).data
#         representation["pool_name"] = instance.pool_name.pool_name if instance.pool_name else None
#         representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None
#         return representation


#     def create(self, validated_data):
#         player_1_name = validated_data.pop('player_1')
#         player_2_name = validated_data.pop('player_2')
#         limit = validated_data.pop('limit')
#         pool_name = validated_data.get('pool_name', None)
#         select_match = validated_data.get('select_match', None)

#         player_1 = Player.objects.get(player_name=player_1_name)
#         player_2 = Player.objects.get(player_name=player_2_name)

#         pair = Pair.objects.create(player_1=player_1, player_2=player_2, pool_name=pool_name, limit=limit,select_match=select_match)
#         return pair

#     def update(self, instance, validated_data):
#         player_1_name = validated_data.pop('player_1', None)
#         player_2_name = validated_data.pop('player_2', None)
#         limit = validated_data.get('limit', instance.limit)
#         pool_name = validated_data.get('pool_name', instance.pool_name)


#         if player_1_name:
#             player_1 = Player.objects.get(player_name=player_1_name)
#             instance.player_1 = player_1
#         if player_2_name:
#             player_2 = Player.objects.get(player_name=player_2_name)
#             instance.player_2 = player_2
#         instance.select_match = validated_data.get('select_match', instance.select_match)
#         instance.limit = limit
#         instance.pool_name = pool_name
#         instance.save()
#         return instance

#===============

# class PairSerializer(serializers.ModelSerializer):
#     player_1 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
#     player_2 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())

#     pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
#     pool_type = serializers.CharField(max_length=500, required=False)
#     select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.none(), allow_null=True, required=False)
#     limit = serializers.IntegerField(required=False)
#     updated_limit = serializers.IntegerField(required=False)
    
#     def __init__(self, *args, **kwargs):
#         super(PairSerializer, self).__init__(*args, **kwargs)

#         if 'data' in kwargs:
#             data = kwargs['data']
#             league_name = data.get('pool_name')
#             match_display_name = data.get('select_match')
#             pool_type = data.get('pool_type')
#             player_1=data.get('player_1')
#             if league_name:
#                 # Filter pool_name queryset based on the league_name provided in the input data
#                 self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,pool_type=pool_type,select_match__match_display_name=match_display_name)

#             if match_display_name:
#                 # Filter select_match queryset based on the match_display_name provided in the input data
#                 self.fields['select_match'].queryset = Match.objects.filter(match_display_name=match_display_name)
#             if player_1:
#                 pid= Match.objects.get(match_display_name= match_display_name)
#                 self.fields['player_1'].queryset =Player.objects.filter(league_name__league_name=pid.select_league)
#                 self.fields['player_2'].queryset = Player.objects.filter(league_name__league_name = pid.select_league)



#     class Meta:
#         model = Pair
#         fields = ['id', 'pool_name','pool_type', 'select_match','player_1', 'player_2', 'limit','updated_limit']

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         # representation["player_1"] = PlayerSerializer(instance.player_1).data
#         # representation["player_2"] = PlayerSerializer(instance.player_2).data
#         player_1_data = PlayerSerializer(instance.player_1).data
#         player_2_data = PlayerSerializer(instance.player_2).data
#         if instance.select_match:
#             print("ok")
#             disable_player_A_ids = []
#             for player in instance.select_match.disable_player_A.all():
#                 disable_player_A_ids.extend([player.id])
#             for player in instance.select_match.disable_player_B.all():
#                 disable_player_A_ids.extend([player.id])
#             print(disable_player_A_ids)
#             player_1_data['status'] = 'disable' if instance.player_1.id in disable_player_A_ids else 'enable'
#             player_2_data['status'] = 'disable' if instance.player_2.id in disable_player_A_ids else 'enable'
#         else:
#             player_1_data['status'] = 'enable'
#             player_2_data['status'] = 'enable'
#         representation["player_1"] = player_1_data
#         representation["player_2"] = player_2_data
#         representation["pool_name"] = AddPool_Serializer(instance.pool_name).data
#         representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None
#         return representation


#     def create(self, validated_data):
#         player_1_name = validated_data.pop('player_1')
#         player_2_name = validated_data.pop('player_2')
#         limit = validated_data.pop('limit')
#         updated_limit = validated_data.pop('updated_limit')

#         pool_name = validated_data.get('pool_name', None)
#         pool_type = validated_data.get('pool_type', None)
#         select_match = validated_data.get('select_match', None)
#         pid= Match.objects.get(match_display_name= select_match)
#         player_1 = Player.objects.get(player_name=player_1_name,league_name__league_name=pid.select_league)
#         player_2 = Player.objects.get(player_name=player_2_name,league_name__league_name=pid.select_league)

#         pair = Pair.objects.create(player_1=player_1, player_2=player_2, pool_name=pool_name,pool_type=pool_type, limit=limit,updated_limit=updated_limit,select_match=select_match)
#         return pair

#     def update(self, instance, validated_data):
#         player_1_name = validated_data.pop('player_1', None)
#         player_2_name = validated_data.pop('player_2', None)
#         limit = validated_data.get('limit', instance.limit)
#         instance.updated_limit = validated_data.get('updated_limit', instance.updated_limit)
#         pool_name = validated_data.get('pool_name', instance.pool_name)
#         instance.pool_type = validated_data.get('pool_type', instance.pool_type)
#         select_match = validated_data.get('select_match', instance.select_match)

#         match_instance = Match.objects.get(match_display_name=select_match)

#         if player_1_name:
#             player_1 = Player.objects.get(player_name=player_1_name, league_name__league_name=match_instance.select_league)
#             instance.player_1 = player_1
#         if player_2_name:
#             player_2 = Player.objects.get(player_name=player_2_name, league_name__league_name=match_instance.select_league)
#             instance.player_2 = player_2

#         instance.select_match = select_match
#         instance.limit = limit
#         instance.pool_name = pool_name
#         instance.save()

#         return instance

#=========================================================
#12/12/24
class PairSerializer(serializers.ModelSerializer):
    player_1 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
    player_2 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())

    pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
    pool_type = serializers.CharField(max_length=500, required=False)
    select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.none(), allow_null=True, required=False)
    limit = serializers.IntegerField(required=False)
    updated_limit = serializers.IntegerField(required=False)
    
    def __init__(self, *args, **kwargs):
        super(PairSerializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('pool_name')
            match_display_name = data.get('select_match')
            pool_type = data.get('pool_type')
            player_1=data.get('player_1')
            if league_name:
                # Filter pool_name queryset based on the league_name provided in the input data
                self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,pool_type=pool_type,select_match__match_display_name=match_display_name)

            if match_display_name:
                # Filter select_match queryset based on the match_display_name provided in the input data
                self.fields['select_match'].queryset = Match.objects.filter(match_display_name=match_display_name)
            if player_1:
                pid= Match.objects.get(match_display_name= match_display_name)
                self.fields['player_1'].queryset =Player.objects.filter(league_name__league_name=pid.select_league)
                self.fields['player_2'].queryset = Player.objects.filter(league_name__league_name = pid.select_league)



    class Meta:
        model = Pair
        fields = ['id', 'pool_name','pool_type', 'select_match','player_1', 'player_2', 'limit','updated_limit']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # representation["player_1"] = PlayerSerializer(instance.player_1).data
        # representation["player_2"] = PlayerSerializer(instance.player_2).data
        player_1_data = PlayerSerializer(instance.player_1).data
        player_2_data = PlayerSerializer(instance.player_2).data
        if instance.select_match:
            print("ok")
            disable_player_A_ids = []
            for player in instance.select_match.disable_player_A.all():
                disable_player_A_ids.extend([player.id])
            for player in instance.select_match.disable_player_B.all():
                disable_player_A_ids.extend([player.id])
            print(disable_player_A_ids)
            player_1_data['status'] = 'disable' if instance.player_1.id in disable_player_A_ids else 'enable'
            player_2_data['status'] = 'disable' if instance.player_2.id in disable_player_A_ids else 'enable'
        else:
            player_1_data['status'] = 'enable'
            player_2_data['status'] = 'enable'
        representation["player_1"] = player_1_data
        representation["player_2"] = player_2_data
        representation["pool_name"] = AddPool_Serializer(instance.pool_name).data
        representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None
        return representation


    # def create(self, validated_data):
    #     player_1_name = validated_data.pop('player_1')
    #     player_2_name = validated_data.pop('player_2')
    #     limit = validated_data.pop('limit')
    #     updated_limit = validated_data.pop('updated_limit')

    #     pool_name = validated_data.get('pool_name', None)
    #     pool_type = validated_data.get('pool_type', None)
    #     select_match = validated_data.get('select_match', None)
    #     pid= Match.objects.get(match_display_name= select_match)
    #     player_1 = Player.objects.get(player_name=player_1_name,league_name__league_name=pid.select_league)
    #     player_2 = Player.objects.get(player_name=player_2_name,league_name__league_name=pid.select_league)

    #     pair = Pair.objects.create(player_1=player_1, player_2=player_2, pool_name=pool_name,pool_type=pool_type, limit=limit,updated_limit=updated_limit,select_match=select_match)
    #     return pair
    
    
    
    def create(self, validated_data):
        return Pair.objects.create(**validated_data)
    
    

    def update(self, instance, validated_data):
        player_1_name = validated_data.pop('player_1', None)
        player_2_name = validated_data.pop('player_2', None)
        limit = validated_data.get('limit', instance.limit)
        updated_limit = validated_data.get('updated_limit', instance.updated_limit)
        pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.pool_type = validated_data.get('pool_type', instance.pool_type)
        select_match = validated_data.get('select_match', instance.select_match)

        match_instance = Match.objects.get(match_display_name=select_match)

        if player_1_name:
            player_1 = Player.objects.get(player_name=player_1_name, league_name__league_name=match_instance.select_league)
            instance.player_1 = player_1
        if player_2_name:
            player_2 = Player.objects.get(player_name=player_2_name, league_name__league_name=match_instance.select_league)
            instance.player_2 = player_2

        instance.select_match = select_match
        instance.limit = limit
        instance.updated_limit = updated_limit
        instance.pool_name = pool_name
        instance.save()

        return instance



# ==========================================================================

# class PlayerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Player
#         fields = ['player_name', 'player_image', 'player_short_name', 'total_run']

# class PlayerNameSerializer(serializers.Serializer):
#     player_name = serializers.CharField(max_length=255)

# class PlayerPairSerializer(serializers.Serializer):
#     player_1 = PlayerNameSerializer()
#     player_2 = PlayerNameSerializer()
#     limit = serializers.IntegerField()

# class PoolSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Add_Pool
#         fields = ['id', 'pool_type', 'pool_name', 'price', 'winning_price', 'fantacy_start_date', 'fantacy_end_date']

# class MatchSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Match
#         fields = ['id', 'select_team_A', 'select_player_A', 'select_team_B', 'select_player_B']

# class PairSerializer(serializers.ModelSerializer):
#     players = PlayerPairSerializer(many=True, write_only=True)
#     pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.all())
#     select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.all())

#     class Meta:
#         model = Pair
#         fields = ['id', 'pool_name', 'select_match', 'players']

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation['players'] = [
#             {
#                 'player_1': PlayerSerializer(instance.player_1).data,
#                 'player_2': PlayerSerializer(instance.player_2).data,
#                 'limit': instance.limit
#             }
#         ]
#         representation['pool_name'] = PoolSerializer(instance.pool_name).data if instance.pool_name else None
#         representation['select_match'] = MatchSerializer(instance.select_match).data if instance.select_match else None
#         return representation

#     def create(self, validated_data):
#         players_data = validated_data.pop('players')
#         pool_name = validated_data.pop('pool_name')
#         select_match = validated_data.pop('select_match')
#         print(players_data)
#         pool_instance = Add_Pool.objects.get(pool_name=pool_name)

#         for player_data in players_data:
#             player_1_data = player_data['player_1']
#             player_2_data = player_data['player_2']
#             limit = player_data['limit']

#             player_1 = Player.objects.get(player_name=player_1_data['player_name'])
#             player_2 = Player.objects.get(player_name=player_2_data['player_name'])

#             pair = Pair.objects.create(
#                 player_1=player_1,
#                 player_2=player_2,
#                 limit=limit,
#                 pool_name=pool_instance,
#                 select_match=select_match
#             )

#         return pair

#     def update(self, instance, validated_data):
#         players_data = validated_data.pop('players', [])
#         pool_name = validated_data.get('pool_name', instance.pool_name.pool_name)
#         select_match = validated_data.get('select_match', instance.select_match)

#         pool_instance = Add_Pool.objects.get(pool_name=pool_name)

#         if players_data:
#             for player_data in players_data:
#                 player_1_data = player_data['player_1']
#                 player_2_data = player_data['player_2']
#                 limit = player_data['limit']

#                 player_1 = Player.objects.get(player_name=player_1_data['player_name'])
#                 player_2 = Player.objects.get(player_name=player_2_data['player_name'])

#                 instance.player_1 = player_1
#                 instance.player_2 = player_2
#                 instance.limit = limit

#         instance.pool_name = pool_instance
#         instance.select_match = select_match
#         instance.save()

#         return instance


#===============Pair with captain serializers====================
# pair_2


class Pair_with_captain_Serializer(serializers.ModelSerializer):
    player_1 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
    player_2 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
    pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
    pool_type = serializers.CharField(max_length=500, required=False)

    select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.none(), allow_null=True, required=False)
    limit = serializers.IntegerField()
    updated_limit = serializers.IntegerField(required=False)

    def __init__(self, *args, **kwargs):
        super(Pair_with_captain_Serializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('pool_name')
            match_display_name = data.get('select_match')
            player_1 = data.get('player_1')
            pool_type = data.get('pool_type')

            if league_name:
                # Filter pool_name queryset based on the league_name provided in the input data
                self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,pool_type=pool_type, select_match__match_display_name=match_display_name)

            if match_display_name:
                # Filter select_match queryset based on the match_display_name provided in the input data
                self.fields['select_match'].queryset = Match.objects.filter(match_display_name=match_display_name)

                # Filter players based on the league associated with the match
                match_instance = Match.objects.get(match_display_name=match_display_name)
                self.fields['player_1'].queryset = Player.objects.filter(league_name__league_name=match_instance.select_league)
                self.fields['player_2'].queryset = Player.objects.filter(league_name__league_name=match_instance.select_league)

    class Meta:
        model = Pair_with_captain
        fields = ['id', 'pool_name','pool_type', 'select_match', 'player_1', 'player_2', 'limit','updated_limit']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # representation["player_1"] = PlayerSerializer(instance.player_1).data
        # representation["player_2"] = PlayerSerializer(instance.player_2).data
        player_1_data = PlayerSerializer(instance.player_1).data
        player_2_data = PlayerSerializer(instance.player_2).data
        if instance.select_match:
            print("ok")
            disable_player_A_ids = []
            for player in instance.select_match.disable_player_A.all():
                disable_player_A_ids.extend([player.id])
            for player in instance.select_match.disable_player_B.all():
                disable_player_A_ids.extend([player.id])
            print(disable_player_A_ids)
            player_1_data['status'] = 'disable' if instance.player_1.id in disable_player_A_ids else 'enable'
            player_2_data['status'] = 'disable' if instance.player_2.id in disable_player_A_ids else 'enable'
        else:
            player_1_data['status'] = 'enable'
            player_2_data['status'] = 'enable'
        representation["player_1"] = player_1_data
        representation["player_2"] = player_2_data
        representation["pool_name"] = AddPool_Serializer(instance.pool_name).data
        representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None
        return representation

    def create(self, validated_data):
        player_1_name = validated_data.pop('player_1')
        player_2_name = validated_data.pop('player_2')
        limit = validated_data.pop('limit')
        pool_name = validated_data.get('pool_name', None)
        pool_type = validated_data.get('pool_type', None)

        select_match = validated_data.get('select_match', None)

        match_instance = Match.objects.get(match_display_name=select_match)

        player_1 = Player.objects.get(player_name=player_1_name, league_name__league_name=match_instance.select_league)
        player_2 = Player.objects.get(player_name=player_2_name, league_name__league_name=match_instance.select_league)

        pair_with_captain = Pair_with_captain.objects.create(player_1=player_1, player_2=player_2, pool_name=pool_name,pool_type=pool_type, limit=limit, select_match=select_match)
        return pair_with_captain

    def update(self, instance, validated_data):
        player_1_name = validated_data.pop('player_1', None)
        player_2_name = validated_data.pop('player_2', None)
        limit = validated_data.get('limit', instance.limit)
        pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.pool_type = validated_data.get('pool_type', instance.pool_type)
        updated_limit = validated_data.get('updated_limit', instance.updated_limit)
        select_match = validated_data.get('select_match', instance.select_match)

        match_instance = Match.objects.get(match_display_name=select_match)

        if player_1_name:
            player_1 = Player.objects.get(player_name=player_1_name, league_name__league_name=match_instance.select_league)
            instance.player_1 = player_1
        if player_2_name:
            player_2 = Player.objects.get(player_name=player_2_name, league_name__league_name=match_instance.select_league)
            instance.player_2 = player_2

        instance.select_match = select_match
        instance.limit = limit
        instance.updated_limit = updated_limit
        instance.pool_name = pool_name
        instance.save()

        return instance

#===============Pair with captain and vice captain serializers===============
# pair_3

class Pair_with_captain_and_v_captain_Serializer(serializers.ModelSerializer):
    player_1 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
    player_2 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
    player_3 = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.none())
    pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
    pool_type = serializers.CharField(max_length=500, required=False)


    select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.none(), allow_null=True, required=False)
    limit = serializers.IntegerField()
    updated_limit = serializers.IntegerField(required=False)

    def __init__(self, *args, **kwargs):
        super(Pair_with_captain_and_v_captain_Serializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('pool_name')
            match_display_name = data.get('select_match')
            pool_type = data.get('pool_type')

            if league_name:
                # Filter pool_name queryset based on the league_name provided in the input data
                self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,pool_type=pool_type, select_match__match_display_name=match_display_name)

            if match_display_name:
                # Filter select_match queryset based on the match_display_name provided in the input data
                self.fields['select_match'].queryset = Match.objects.filter(match_display_name=match_display_name)

                # Filter players based on the league associated with the match
                match_instance = Match.objects.get(match_display_name=match_display_name)
                self.fields['player_1'].queryset = Player.objects.filter(league_name__league_name=match_instance.select_league)

                self.fields['player_2'].queryset = Player.objects.filter(league_name__league_name=match_instance.select_league)
                self.fields['player_3'].queryset = Player.objects.filter(league_name__league_name=match_instance.select_league)

    class Meta:
        model = Pair_with_captain_and_v_captain
        fields = ['id', 'pool_name','pool_type', 'select_match', 'player_1', 'player_2','player_3', 'limit','updated_limit']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # representation["player_1"] = PlayerSerializer(instance.player_1).data
        # representation["player_2"] = PlayerSerializer(instance.player_2).data
        # representation["player_3"] = PlayerSerializer(instance.player_3).data
        player_1_data = PlayerSerializer(instance.player_1).data
        player_2_data = PlayerSerializer(instance.player_2).data
        player_3_data = PlayerSerializer(instance.player_3).data

        if instance.select_match:
            print("ok")
            disable_player_A_ids = []
            for player in instance.select_match.disable_player_A.all():
                disable_player_A_ids.extend([player.id])
            for player in instance.select_match.disable_player_B.all():
                disable_player_A_ids.extend([player.id])
            print(disable_player_A_ids)
            player_1_data['status'] = 'disable' if instance.player_1.id in disable_player_A_ids else 'enable'
            player_2_data['status'] = 'disable' if instance.player_2.id in disable_player_A_ids else 'enable'
            player_3_data['status'] = 'disable' if instance.player_3.id in disable_player_A_ids else 'enable'
        else:
            player_1_data['status'] = 'enable'
            player_2_data['status'] = 'enable'
            player_3_data['status'] = 'enable'

        representation["player_1"] = player_1_data
        representation["player_2"] = player_2_data
        representation["player_3"] = player_3_data
        representation["pool_name"] = AddPool_Serializer(instance.pool_name).data
        representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None
        return representation

    def create(self, validated_data):
        player_1_name = validated_data.pop('player_1')
        player_2_name = validated_data.pop('player_2')
        player_3_name = validated_data.pop('player_3')

        limit = validated_data.pop('limit')
        pool_name = validated_data.get('pool_name', None)
        select_match = validated_data.get('select_match', None)
        pool_type = validated_data.get('pool_type', None)

        match_instance = Match.objects.get(match_display_name=select_match)

        player_1 = Player.objects.get(player_name=player_1_name, league_name__league_name=match_instance.select_league)
        player_2 = Player.objects.get(player_name=player_2_name, league_name__league_name=match_instance.select_league)
        player_3 = Player.objects.get(player_name=player_3_name, league_name__league_name=match_instance.select_league)

        pair_with_captain = Pair_with_captain_and_v_captain.objects.create(player_1=player_1, player_2=player_2,player_3=player_3, pool_name=pool_name, pool_type=pool_type, limit=limit, select_match=select_match)
        return pair_with_captain

    def update(self, instance, validated_data):
        player_1_name = validated_data.pop('player_1', None)
        player_2_name = validated_data.pop('player_2', None)
        player_3_name = validated_data.pop('player_3', None)

        limit = validated_data.get('limit', instance.limit)
        updated_limit = validated_data.get('updated_limit', instance.updated_limit)
        pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.pool_type = validated_data.get('pool_type', instance.pool_type)

        select_match = validated_data.get('select_match', instance.select_match)

        match_instance = Match.objects.get(match_display_name=select_match)

        if player_1_name:
            player_1 = Player.objects.get(player_name=player_1_name, league_name__league_name=match_instance.select_league)
            instance.player_1 = player_1
        if player_2_name:
            player_2 = Player.objects.get(player_name=player_2_name, league_name__league_name=match_instance.select_league)
            instance.player_2 = player_2
        if player_3_name:
            player_3 = Player.objects.get(player_name=player_3_name, league_name__league_name=match_instance.select_league)
            instance.player_3 = player_3

        instance.select_match = select_match
        instance.limit = limit
        instance.updated_limit = updated_limit
        instance.pool_name = pool_name
        instance.save()

        return instance



#==================================================================

class new_serializers(serializers.Serializer):
    id = serializers.IntegerField(required=False)

    widget_group_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=100),

        # max_length=2,
    )
    class Meta:
        models = new
        fields ='__all__'
        exclude = ('id',)

    def create(self, validated_data):
        return new.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.widget_group_ids=validated_data.get('widget_group_ids',instance.widget_group_ids)
        instance.save()
        return instance

#=======================Match  Serializer==============

# class MatchSerializer(serializers.ModelSerializer):
#     select_league = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=False, allow_null=True)
#     # select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)

#     select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.none(), required=True)


#     select_player_A = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
#     # select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)

#     select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.none(), required=True)

#     def __init__(self, *args, **kwargs):
#         super(MatchSerializer, self).__init__(*args, **kwargs)

#         if 'data' in kwargs:
#             data = kwargs['data']
#             league_name = data.get('select_league')

#             if league_name:
#                 # Filter team_name queryset based on the league_name provided in the input data
#                 self.fields['select_team_B'].queryset = Team.objects.filter(league_name__league_name=league_name)
#                 self.fields['select_team_A'].queryset = Team.objects.filter(league_name__league_name=league_name)

#     select_player_B = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
#     match_start_date = serializers.CharField(max_length=50, required=False, allow_null=True)
#     match_end_date = serializers.CharField(max_length=50, required=False, allow_null=True)

#     class Meta:
#         model = Match
#         fields = ['id', 'select_league', 'select_team_A', 'select_player_A', 'select_team_B', 'select_player_B', 'match_start_date','match_end_date','match_display_name']

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation["select_league"] = Leagueserializers(instance.select_league).data
#         representation["select_team_A"] = Teamserializers(instance.select_team_A).data
#         representation["select_player_A"] = PlayerSerializer(instance.select_player_A, many=True).data
#         representation["select_team_B"] = Teamserializers(instance.select_team_B).data
#         representation["select_player_B"] = PlayerSerializer(instance.select_player_B, many=True).data
#         return representation

#     def update(self, instance, validated_data):
#         instance.select_league = validated_data.get('select_league', instance.select_league)
#         instance.select_team_A = validated_data.get('select_team_A', instance.select_team_A)
#         instance.select_team_B = validated_data.get('select_team_B', instance.select_team_B)
#         instance.match_start_date = validated_data.get('match_start_date', instance.match_start_date)
#         instance.match_end_date = validated_data.get('match_end_date', instance.match_end_date)

#         select_player_A_data = validated_data.pop('select_player_A', [])
#         select_player_B_data = validated_data.pop('select_player_B', [])

#         instance.select_player_A.set(
#             Player.objects.filter(player_name__in=[player.player_name for player in select_player_A_data])
#         )
#         instance.select_player_B.set(
#             Player.objects.filter(player_name__in=[player.player_name for player in select_player_B_data])
#         )

#         instance.save()
#         return instance

class PlayerSerializer11(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["id","team_name",'player_name','player_image',"player_short_name","total_run",'run']
class MatchSerializer(serializers.ModelSerializer):
    select_league = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=False, allow_null=True)
    # select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)

    select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.none(), required=True)


    select_player_A = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    # select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)

    select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.none(), required=True)

    def __init__(self, *args, **kwargs):
        super(MatchSerializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('select_league')

            if league_name:
                # Filter team_name queryset based on the league_name provided in the input data
                self.fields['select_team_B'].queryset = Team.objects.filter(league_name__league_name=league_name)
                self.fields['select_team_A'].queryset = Team.objects.filter(league_name__league_name=league_name)

    select_player_B = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    match_start_date = serializers.CharField(max_length=50, required=False, allow_null=True)
    match_end_date = serializers.CharField(max_length=50, required=False, allow_null=True)
    disable_player_A = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    disable_player_B = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    player_list = serializers.ListField(child=serializers.IntegerField(), required=False, allow_null=True)

    class Meta:
        model = Match
        fields = ['id', 'select_league', 'select_team_A', 'select_player_A', 'select_team_B', 'select_player_B', 'match_start_date','match_end_date','match_display_name','disable_player_A','disable_player_B','player_list','match_end_status']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["select_league"] = Leagueserializers(instance.select_league).data
        representation["select_team_A"] = Teamserializers(instance.select_team_A).data
        representation["select_player_A"] = PlayerSerializer(instance.select_player_A, many=True).data
        representation["select_team_B"] = Teamserializers(instance.select_team_B).data
        representation["select_player_B"] = PlayerSerializer(instance.select_player_B, many=True).data
        representation["disable_player_A"] = PlayerSerializer11(instance.disable_player_A, many=True).data
        representation["disable_player_B"] = PlayerSerializer11(instance.disable_player_B, many=True).data
        for player in representation["select_player_A"]:
            player['status'] = 'disable' if any(disable_player['id'] == player['id'] for disable_player in representation["disable_player_A"]) else 'enable'

        for player in representation["select_player_B"]:
            player['status'] = 'disable' if any(disable_player['id'] == player['id'] for disable_player in representation["disable_player_B"]) else 'enable'
        return representation

    def update(self, instance, validated_data):
        instance.select_league = validated_data.get('select_league', instance.select_league)
        instance.select_team_A = validated_data.get('select_team_A', instance.select_team_A)
        instance.select_team_B = validated_data.get('select_team_B', instance.select_team_B)
        instance.match_start_date = validated_data.get('match_start_date', instance.match_start_date)
        instance.match_end_date = validated_data.get('match_end_date', instance.match_end_date)
        instance.match_end_status = validated_data.get('match_end_status', instance.match_end_status)
        player_list_data = validated_data.get('player_list', [])
        if player_list_data:
            # if instance.player_list is None:
            instance.player_list = list(player_list_data)  # Convert to set to remove duplicates
            # else:
            #     # Create a set of existing players to avoid duplicates
            #     existing_players = set(instance.player_list)
            #     # Extend the player list with only unique new entries
            #     instance.player_list.extend(player for player in player_list_data if player not in existing_players)
        select_player_A_data = validated_data.pop('select_player_A', [])
        select_player_B_data = validated_data.pop('select_player_B', [])
        disable_player_data_A = validated_data.pop('disable_player_A', [])
        disable_player_data_B = validated_data.pop('disable_player_B', [])

        instance.select_player_A.set(select_player_A_data)
        instance.select_player_B.set(select_player_B_data)
        if disable_player_data_A:
            instance.disable_player_A.set(disable_player_data_A)
        if disable_player_data_B:
            instance.disable_player_B.set(disable_player_data_B)

        # instance.select_player_A.set(
        #     Player.objects.filter(player_name__in=[player.player_name for player in select_player_A_data])
        # )
        # instance.select_player_B.set(
        #     Player.objects.filter(player_name__in=[player.player_name for player in select_player_B_data])
        # )
        # instance.disable_player_A.set(
        #     Player.objects.filter(player_name__in=[player.player_name for player in disable_player_data_A])
        # )
        # instance.disable_player_B.set(
        #     Player.objects.filter(player_name__in=[player.player_name for player in disable_player_data_B])
        # )

        instance.save()
        return instance
#============= Match Serializer for add pool show data===================
class Player___Serializer11(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["id","team_name",'player_name','player_image',"player_short_name","total_run"]
class Match_Serializer(serializers.ModelSerializer):
    match_id = serializers.IntegerField(required=False,source='id')
    select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)

    select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
    select_player_A = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    select_player_B = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    match_end_status=serializers.CharField(max_length=500,read_only=True)
    class Meta:
        model = Match
        fields = ['select_team_A',"select_player_A",'select_team_B',"select_player_B","match_display_name","match_id","disable_player_A",'disable_player_B','match_end_status']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["select_team_A"] = Teamserializers(instance.select_team_A).data

        representation["select_team_B"] = Teamserializers(instance.select_team_B).data

        representation["select_player_A"] = PlayerSerializer(instance.select_player_A, many=True).data
        representation["select_player_B"] = PlayerSerializer(instance.select_player_B, many=True).data
        representation["disable_player_A"] = Player___Serializer11(instance.disable_player_A, many=True).data
        representation["disable_player_B"] = Player___Serializer11(instance.disable_player_B, many=True).data
        for player in representation["select_player_A"]:
            player['status'] = 'disable' if any(disable_player['id'] == player['id'] for disable_player in representation["disable_player_A"]) else 'enable'

        for player in representation["select_player_B"]:
            player['status'] = 'disable' if any(disable_player['id'] == player['id'] for disable_player in representation["disable_player_B"]) else 'enable'
        return representation

    def update(self, instance, validated_data):

        instance.select_team_A = validated_data.get('select_team_A', instance.select_team_A)
        instance.select_team_B = validated_data.get('select_team_B', instance.select_team_B)


        instance.save()
        return instance




#=================Add Pool Serializer============================
class AddPoolSerializer(serializers.ModelSerializer):
    select_match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.all(), required=False, allow_null=True)
    price = serializers.ListField(child=serializers.IntegerField(), required=False, allow_null=True)


    class Meta:
        model = Add_Pool
        fields = ['id', 'select_match', 'pool_type', 'pool_name', 'price', 'winning_price', 'fantacy_start_date', 'fantacy_end_date']
        # fields = ['id', 'select_match', 'pool_type', 'pool_name', 'price', 'winning_price', 'fantacy_start_date']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None

        return representation




    def update(self, instance, validated_data):
        instance.select_match = validated_data.get('select_match', instance.select_match)
        instance.pool_type = validated_data.get('pool_type', instance.pool_type)
        instance.pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.price = validated_data.get('price', instance.price)
        instance.winning_price = validated_data.get('winning_price', instance.winning_price)
        instance.fantacy_start_date = validated_data.get('fantacy_start_date', instance.fantacy_start_date)
        instance.fantacy_end_date = validated_data.get('fantacy_end_date', instance.fantacy_end_date)

        instance.save()
        return instance






#================Captain Add Pool Serializer=============================
class Captain_Add_PoolSerializer(serializers.ModelSerializer):
    select_league = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=False, allow_null=True)
    select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
    select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
    select_player_A = PlayerSerializer(many=True, required=False)
    select_player_B = PlayerSerializer(many=True, required=False)
    captain = PlayerSerializer(many=True, required=False)

    match_start_date = serializers.CharField(max_length=50, required=False, allow_null=True)

    class Meta:
        model = Captain_Add_Pool
        fields = ['id', 'select_league', 'select_team_A', 'select_player_A', 'select_team_B', 'select_player_B', 'captain', 'match_start_date', 'match_display_name']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.select_league:
            representation["select_league"] = League_serializers(instance.select_league).data

        if instance.select_team_A:
            representation["select_team_A"] = Team_serializers(instance.select_team_A).data

        if instance.select_team_B:
            representation["select_team_B"] = Team_serializers(instance.select_team_B).data

        if instance.select_player_A:
            representation["select_player_A"] = PlayerSerializer(instance.select_player_A.all(), many=True).data

        if instance.select_player_B:
            representation["select_player_B"] = PlayerSerializer(instance.select_player_B.all(), many=True).data

        if instance.captain:
            representation["captain"] = PlayerSerializer(instance.captain.all(), many=True).data



        return representation

    def update(self, instance, validated_data):
        instance.select_league = validated_data.get('select_league', instance.select_league)
        instance.select_team_A = validated_data.get('select_team_A', instance.select_team_A)
        instance.select_player_A = validated_data.get('select_player_A', instance.select_player_A)
        instance.select_team_B = validated_data.get('select_team_B', instance.select_team_B)
        instance.select_player_B = validated_data.get('select_player_B', instance.select_player_B)
        instance.captain = validated_data.get('captain', instance.captain)
        instance.match_start_date = validated_data.get('match_start_date', instance.match_start_date)
        instance.match_display_name = validated_data.get('match_display_name', instance.match_display_name)

        instance.save()
        return instance


#============================================
# class Captain_Add_PoolSerializer(serializers.ModelSerializer):
#     select_league = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=False, allow_null=True)
#     select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
#     select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
#     select_player_A = PlayerSerializer(many=True, required=False)
#     select_player_B = PlayerSerializer(many=True, required=False)
#     captain = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), required=False)

#     match_start_date = serializers.CharField(max_length=50, required=False, allow_null=True)

#     class Meta:
#         model = Captain_Add_Pool
#         fields = ['id', 'select_league', 'select_team_A', 'select_player_A', 'select_team_B', 'select_player_B', 'captain', 'match_start_date', 'match_display_name']

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)

#         if instance.select_league:
#             representation["select_league"] = League_serializers(instance.select_league).data

#         if instance.select_team_A:
#             representation["select_team_A"] = Team_serializers(instance.select_team_A).data

#         if instance.select_team_B:
#             representation["select_team_B"] = Team_serializers(instance.select_team_B).data

#         if instance.select_player_A:
#             representation["select_player_A"] = PlayerSerializer(instance.select_player_A.all(), many=True).data

#         if instance.select_player_B:
#             representation["select_player_B"] = PlayerSerializer(instance.select_player_B.all(), many=True).data

#         if instance.captain:
#             representation["captain"] = PlayerSerializer(instance.captain.all(), many=True).data



#         return representation



#=============Vice Captain Add Pool Serializer===================

class Vice_Captain_Add_PoolSerializer(serializers.ModelSerializer):
    select_league = serializers.SlugRelatedField(slug_field='league_name', queryset=League.objects.all(), required=False, allow_null=True)
    select_team_A = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
    select_team_B = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), required=False, allow_null=True)
    select_player_A = PlayerSerializer(many=True, required=False)
    select_player_B = PlayerSerializer(many=True, required=False)
    captain = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), required=False, many=True)
    vice_captain = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), required=False, many=True)
    match_start_date = serializers.CharField(max_length=50, required=False, allow_null=True)

    class Meta:
        model = Vice_Captain_Add_Pool
        fields = ['id', 'select_league', 'select_team_A', 'select_player_A', 'select_team_B', 'select_player_B', 'captain', 'vice_captain', 'match_start_date', 'match_display_name']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.select_league:
            representation["select_league"] = League_serializers(instance.select_league).data

        if instance.select_team_A:
            representation["select_team_A"] = Team_serializers(instance.select_team_A).data

        if instance.select_team_B:
            representation["select_team_B"] = Team_serializers(instance.select_team_B).data

        if instance.select_player_A:
            representation["select_player_A"] = PlayerSerializer(instance.select_player_A.all(), many=True).data

        if instance.select_player_B:
            representation["select_player_B"] = PlayerSerializer(instance.select_player_B.all(), many=True).data

        if instance.captain:
            representation["captain"] = PlayerSerializer(instance.captain.all(), many=True).data

        if instance.vice_captain:
            representation["vice_captain"] = PlayerSerializer(instance.vice_captain.all(), many=True).data

        return representation






    def update(self, instance, validated_data):
            instance.select_league = validated_data.get('select_league', instance.select_league)
            instance.select_team_A = validated_data.get('select_team_A', instance.select_team_A)
            instance.select_player_A = validated_data.get('select_player_A', instance.select_player_A)
            instance.select_team_B = validated_data.get('select_team_B', instance.select_team_B)
            instance.select_player_B = validated_data.get('select_player_B', instance.select_player_B)
            instance.captain = validated_data.get('captain', instance.captain)
            instance.vice_captain = validated_data.get('vice_captain', instance.vice_captain)
            instance.match_start_date = validated_data.get('match_start_date', instance.match_start_date)
            instance.match_display_name = validated_data.get('match_display_name', instance.match_display_name)

            instance.save()
            return instance





#==============Pool Declare Serializer=================
class Player_declare_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'player_name','player_short_name','player_image']

class Team_declare_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'team_name','team_short_name','team_image']

# class Pool_Declare_Serializer(serializers.ModelSerializer):
#     player_declare = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), allow_null=True, required=False)
#     team_declare = serializers.SlugRelatedField(slug_field='team_name', queryset=Team.objects.all(), allow_null=True, required=False)
#     total_run = serializers.IntegerField(required=False, allow_null=True)

#     class Meta:
#         model = Pool_Declare
#         fields = ['id', 'player_declare', 'team_declare', 'total_run']

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation["player_declare"] = Player_declare_Serializer(instance.player_declare).data if instance.player_declare else None
#         representation["team_declare"] = Team_declare_Serializer(instance.team_declare).data if instance.team_declare else None
#         return representation

#     def update(self, instance, validated_data):
#         instance.player_declare = validated_data.get('player_declare', instance.player_declare)
#         instance.team_declare = validated_data.get('team_declare', instance.team_declare)
#         instance.total_run = validated_data.get('total_run', instance.total_run)

#         instance.save()
#         return instance

class Pool_Declare_Serializer(serializers.ModelSerializer):
    player_declare = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), allow_null=True, required=False)
    team_declare = serializers.SlugRelatedField(slug_field='id', queryset=Team.objects.all(), allow_null=True, required=False)
    total_run = serializers.IntegerField(required=False, allow_null=True)
    pool_name = serializers.SlugRelatedField(slug_field='id', queryset=Add_Pool.objects.all(), allow_null=True, required=False)
    select_match = serializers.SlugRelatedField(slug_field='id', queryset=Match.objects.all(), allow_null=True, required=False)
    date_time = serializers.SerializerMethodField()
    # def __init__(self, *args, **kwargs):
    #     super(Pool_Declare_Serializer, self).__init__(*args, **kwargs)

    #     if 'data' in kwargs:
    #         data = kwargs['data']
    #         team_name = data.get('team_declare')
    #         match_name = data.get('select_match')
    #         pool_name = data.get('pool_name')
    #         print("kdsjlkdsajf",team_name)
    #         print("kdsjlkdsajf",match_name)

    #         if team_name:
    #             # Filter team_name queryset based on the league_name provided in the input data
    #             # self.fields['player_declare'].queryset = Player.objects.filter(team_name__team_name=team_name)
    #             self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=pool_name,select_match__match_display_name=match_name)

    class Meta:
        model = Pool_Declare
        fields = ['id', 'player_declare', 'team_declare', 'total_run','date_time','pool_name','select_match']
    def get_date_time(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.date_time.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["player_declare"] = Player_declare_Serializer(instance.player_declare).data if instance.player_declare else None
        representation["team_declare"] = Team_declare_Serializer(instance.team_declare).data if instance.team_declare else None
        representation["pool_name"] = instance.pool_name.pool_name if instance.pool_name else None
        representation["select_match"] = Match_Serializer(instance.select_match).data if instance.select_match else None
        return representation

    def update(self, instance, validated_data):
        instance.player_declare = validated_data.get('player_declare', instance.player_declare)
        instance.team_declare = validated_data.get('team_declare', instance.team_declare)
        instance.total_run = validated_data.get('total_run', instance.total_run)
        instance.pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.select_match = validated_data.get('select_match', instance.select_match)

        instance.save()
        return instance




import pytz
#================users nested address===================
class AddressSerializer(serializers.Serializer):
    state = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=255)
    country = serializers.CharField(max_length=255)
    pincode = serializers.IntegerField()
    class Meta:
        models = address_data
        fields ='__all__'
        exclude = ('id',)

#================================
class User_Doc_Serializer(serializers.Serializer):
    aadhar_card_front = serializers.FileField(required=False)
    aadhar_card_back = serializers.FileField(required=False)
    pan_card_front = serializers.FileField(required=False)
    pan_card_back = serializers.FileField(required=False)
    # bank_passbook = serializers.FileField(required=True)
    account_number = serializers.IntegerField(required=False)
    ifsc_code=serializers.CharField(max_length=200,required=False)
    bank_name=serializers.CharField(max_length=200,required=False)
    branch_name=serializers.CharField(max_length=200,required=False)
    state=serializers.CharField(max_length=200,required=False)

    class Meta:
        models = user_document
        fields ='__all__'
        exclude = ('id',)
#==============USER===============
class ReferralUserDataSerializer(serializers.ModelSerializer):
    # referred_user_id = serializers.CharField(source='referred_user.user_id')
    # referred_user_name = serializers.CharField(source='referred_user.name')
    # class Meta:
    #     model = referral
    #     fields = ['referred_user_id', 'referred_user_name']


    id = serializers.IntegerField(source='referred_user.id')
    user_id = serializers.CharField(source='referred_user.user_id')
    name = serializers.CharField(source='referred_user.name')
    image=serializers.ImageField(source='referred_user.image')
    class Meta:
        model = referral
        fields = ['id','user_id', 'name','image']

class scretch(serializers.ModelSerializer):
    class Meta:
        model = Scrach_coupon
        fields = "__all__"

class user_serializers(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    user_id=serializers.CharField(max_length=100,required=True)
    referred_code = serializers.CharField(max_length=50, required=False)

    name=serializers.CharField(max_length=100,required=True)
    gender=serializers.CharField(max_length=100,required=True)
    dob=serializers.CharField(max_length=100,required=True)
    address = AddressSerializer()
    user_doc = User_Doc_Serializer(required=False)
    mobile_no = serializers.IntegerField(required=True)
    email=serializers.CharField(max_length=100,required=True)
    wallet_amount = serializers.IntegerField(required=True)
    winning_amount = serializers.IntegerField(required=True)
    image=serializers.ImageField(required=False)
    date_time = serializers.SerializerMethodField()
    profile_change_time = serializers.SerializerMethodField()
    status=serializers.CharField(max_length=100,required=False)
    device_token=serializers.CharField(max_length=255,required=True)
    profile_status=serializers.CharField(max_length=255,required=False)
    rejection_reason=serializers.CharField(required=False)
    referral_user_data = serializers.SerializerMethodField()
    referral_by = serializers.CharField(max_length=500,required=False)
    # scrach_list = serializers.SlugRelatedField(slug_field='id', queryset=Scrach_coupon.objects.all(), many=True, required=False, allow_null=True)
    total_deposited_amount = serializers.FloatField(required=False)
    total_profit_amount = serializers.FloatField(required=False)
    referral_amount = serializers.IntegerField(required=False)
    bonus_amount = serializers.IntegerField(required=False)
    deposit_amount = serializers.IntegerField(required=False)
    referral_user_leagth = serializers.IntegerField(required=False)
    scrach_list=serializers.ListField(child=serializers.IntegerField(), required=False, allow_null=True)
    scratched_coupon_list=serializers.ListField(child=serializers.IntegerField(), required=False, allow_null=True)
    total_withdrawal_amount = serializers.FloatField(required=False)
    class Meta:
        models=user
        fields ='__all__'
        exclude = ('id',)
    def validate_mobile_no(self, value):
        request = self.context.get("request")  # Get request object
        user_id = self.instance.id if self.instance else None  # Get current instance ID

        # Check if the mobile number exists and belongs to a different user
        if user.objects.filter(mobile_no=value).exists():
            raise serializers.ValidationError("This mobile number is already registered.")
        
        return value

    def get_date_time(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.date_time.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')
    def get_profile_change_time(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.profile_change_time.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')    

    def get_referral_user_data(self, obj):
        referral_data = obj.referral_user_data.all()
        return ReferralUserDataSerializer(referral_data, many=True).data
    def generate_referral_code(self):
        code = uuid.uuid4().hex[:6].upper()
        # Ensure the generated code is unique
        while user.objects.filter(referred_code=code).exists():
            code = uuid.uuid4().hex[:6].upper()
        return code
        
    def create(self, validated_data):
        # scratch_card1 = validated_data.pop('scrach_list', [])
        scratch_card11 = validated_data.pop('scrach_list', [])
        scratched_coupon_list = validated_data.pop('scratched_coupon_list', [])
        address_data1 = validated_data.pop('address', None)
        user_doc_data = validated_data.pop('user_doc', None)
        print(address_data1)
        referral_code = self.generate_referral_code()
        validated_data['referred_code'] = referral_code
        if address_data1:
            address_instance = address_data.objects.create(**address_data1)
            validated_data['address'] = address_instance
        if user_doc_data:
            user_doc_instance = user_document.objects.create(**user_doc_data)
            validated_data['user_doc'] = user_doc_instance
        instance = user.objects.create(**validated_data)
        # instance.scrach_list.set(scratch_card1)
        if scratch_card11:
        # Just assign the list of IDs directly to the ListTextField
            instance.scrach_list = scratch_card11
        if scratched_coupon_list:
        # Just assign the list of IDs directly to the ListTextField
            instance.scratched_coupon_list = scratched_coupon_list    
        instance.save()
        return instance

    def update(self, instance, validated_data):
        address_data1 = validated_data.pop('address', None)
        user_doc_data = validated_data.pop('user_doc', None)
        instance.name=validated_data.get('name',instance.name)
        instance.user_id=validated_data.get('user_id',instance.user_id)
        instance.gender=validated_data.get('gender',instance.gender)
        instance.dob=validated_data.get('dob',instance.dob)

        instance.mobile_no=validated_data.get('mobile_no',instance.mobile_no)
        instance.referral_user_leagth=validated_data.get('referral_user_leagth',instance.referral_user_leagth)
        instance.email=validated_data.get('email',instance.email)
        instance.wallet_amount=validated_data.get('wallet_amount',instance.wallet_amount)
        instance.total_deposited_amount=validated_data.get('total_deposited_amount',instance.total_deposited_amount)
        instance.total_profit_amount=validated_data.get('total_profit_amount',instance.total_profit_amount)
        instance.winning_amount=validated_data.get('winning_amount',instance.winning_amount)
        instance.image=validated_data.get('image',instance.image)
        instance.status=validated_data.get('status',instance.status)
        instance.device_token=validated_data.get('device_token',instance.device_token)
        instance.profile_status=validated_data.get('profile_status',instance.profile_status)
        instance.rejection_reason=validated_data.get('rejection_reason',instance.rejection_reason)
        instance.referral_amount=validated_data.get('referral_amount',instance.referral_amount)
        instance.bonus_amount=validated_data.get('bonus_amount',instance.bonus_amount)
        instance.deposit_amount=validated_data.get('deposit_amount',instance.deposit_amount)
        instance.total_withdrawal_amount=validated_data.get('total_withdrawal_amount',instance.total_withdrawal_amount)
        # instance.date=validated_data.get('date',instance.date)
        
        if address_data1:
            # Create or update the Address instance
            address_instance, created = address_data.objects.update_or_create(
                defaults=address_data1,
                id=instance.address.id if instance.address else None
            )
            instance.address = address_instance
        if user_doc_data:
            user_doc_data_instance, created = user_document.objects.update_or_create(
                defaults=user_doc_data,
                id=instance.user_doc.id if instance.user_doc else None
            )
            instance.user_doc = user_doc_data_instance

        # for attr, value in validated_data.items():
        #     setattr(instance, attr, value)
        # players_data = validated_data.get('scrach_list', None)
        # if players_data is not None:
        #     instance.scrach_list.set(players_data)
        player_list_data = validated_data.get('scrach_list', [])
        if player_list_data:
            instance.scrach_list = list(player_list_data) 
        scratched_coupon_list = validated_data.get('scratched_coupon_list', [])
        if scratched_coupon_list:
            instance.scratched_coupon_list = list(scratched_coupon_list)    
        instance.save()
        instance.save()
        return instance


    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['referral_user_data'] = self.get_referral_user_data(instance)
        # representation["scrach_list"] = [
        #     {

        #         "id": player.id,
        #          "coupon_point": player.coupon_point,
        #         "image": player.image.url if player.image and hasattr(player.image, 'url') else None


        #     } for player in instance.scrach_list.all()
        # ]

        if representation.get("referral_by"):
            try:
                referrer = user.objects.get(referred_code=representation["referral_by"])
                representation["referral_by"] = {
                    "id": referrer.id,
                    "username":referrer.name,
                    "image": referrer.image.url if referrer.image and hasattr(referrer.image, 'url') else None

                }
            except user.DoesNotExist:
                representation["referral_by"] = None
        scrach_coupon_ids = instance.scrach_list
        print(scrach_coupon_ids,"fdaskjdsajoi") 
        # Create an empty list to store serialized data
        scrach_coupon_data = []

        # Iterate over each ID in scrach_list to fetch the corresponding Scrach_coupon object
        if scrach_coupon_ids == None:
            representation['scrach_list'] = []  
        else:
            for coupon_id in scrach_coupon_ids:
                # Query each Scrach_coupon object by its ID
                scrach_coupon = Scrach_coupon.objects.filter(id=coupon_id).first()
                if scrach_coupon:
                    # Serialize each fetched Scrach_coupon object and append it to the list
                    scrach_coupon_data.append(scretch(scrach_coupon).data)

            # Replace the scrach_list field in the representation with serialized data
            representation['scrach_list'] = scrach_coupon_data     
        if representation['scratched_coupon_list'] == None:
            representation['scratched_coupon_list'] = [] 
             


        # scratch_list = representation.get('scrach_list', [])
        scratched_coupon_list = representation.get('scratched_coupon_list', [])
        print(scratched_coupon_list,"dfsfda")
        if 'scrach_list' in representation:
            representation['scrach_list'] = [
                {'index': index, 'value': value} for index, value in enumerate(representation['scrach_list'])
            ]
        
        # Initialize the list to store indices
        index_list = scratched_coupon_list

        for index in index_list:
            if index < len(representation['scrach_list']):  # Check if the index is valid
                
                representation['scrach_list'][index]['value']['read'] = True    
        return representation
#==============login==================
class LoginSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    email=serializers.CharField(max_length=50,required=True)
    password=serializers.CharField(max_length=50,required=True)
    admin_type=serializers.CharField(read_only=True)



    class Meta:
        models=login_user
        fields ='__all__'
        exclude = ('id',)

#-------------
class login_serializers(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    email=serializers.CharField(max_length=50,required=True)
    password=serializers.CharField(max_length=50,required=True)
    admin_type=serializers.CharField(read_only=True)
    class Meta:
        models=login_user
        fields ='__all__'
        exclude = ('id',)


    def create(self, validated_data):
        return login_user.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.email=validated_data.get('email',instance.email)
        instance.password=validated_data.get('password',instance.password)
        instance.admin_type=validated_data.get('admin_type',instance.admin_type)
        instance.save()
        return instance




#============================UserPoolHistorySerializer==============================
class Match___Serializer(serializers.ModelSerializer):
    select_league=League_serializers()
    select_team_A=Teamserializers()
    select_team_B=Teamserializers()

    class Meta:
        model = Match
        fields = ['id','select_league','match_display_name','select_team_A','select_team_B','match_end_status']


class AddPool__Serializer(serializers.ModelSerializer):
    class Meta:
        model = Add_Pool
        fields = ['id', 'pool_name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user
        fields = ['name']

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id','team_name', 'player_name', 'player_short_name', 'player_image','status','run']

class UserPoolHistorySerializer(serializers.ModelSerializer):
    match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.all(), required=False, allow_null=True)
    pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
    user_data = serializers.SlugRelatedField(slug_field='name', queryset=user.objects.all(), allow_null=True, required=False)
    player_pair = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)

    class Meta:
        model = user_pool_history
        fields = ['id', 'match', 'pool_name', 'user_data', 'pool_type', 'player_pair', 'entry_fee', 'winning_amount', 'date']
    def __init__(self, *args, **kwargs):
        super(UserPoolHistorySerializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('pool_name')
            match_display_name = data.get('match')

            if league_name:
                # Filter pool_name queryset based on the league_name provided in the input data
                self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,select_match__match_display_name=match_display_name)


    def create(self, validated_data):
        # Manually handle the many-to-many field
        players_data = validated_data.pop('player_pair', [])
        match = user_pool_history.objects.create(**validated_data)
        match.player_pair.set(players_data)
        return match



    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['match'] = Match___Serializer(instance.match).data if instance.match else None
        representation['pool_name'] = AddPool__Serializer(instance.pool_name).data if instance.pool_name else None
        representation['user_data'] = UserSerializer(instance.user_data).data if instance.user_data else None
        # representation["player_pair"] = PlayerSerializer(instance.player_pair, many=True).data
        representation['pool_type'] = instance.pool_name.pool_type if instance.pool_name else None
        representation["player_pair"] = [
            {
                "player_name": player.player_name,
                "total_run": player.total_run,
                "player_image": player.player_image.url if player.player_image else None
            } for player in instance.player_pair.all()
        ]

        return representation



    def update(self, instance, validated_data):
        # Pop out the player_pair data
        player_pair_data = validated_data.pop('player_pair', [])

        # Update other fields
        instance.match = validated_data.get('match', instance.match)
        instance.pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.user_data = validated_data.get('user_data', instance.user_data)
        instance.pool_type = validated_data.get('pool_type', instance.pool_type)
        instance.entry_fee = validated_data.get('entry_fee', instance.entry_fee)
        instance.winning_amount = validated_data.get('winning_amount', instance.winning_amount)
        instance.date = validated_data.get('date', instance.date)

        # Save instance before updating many-to-many field
        instance.save()

        # Update many-to-many field using .set()
        instance.player_pair.set(player_pair_data)

        return instance



#=================view_contest_detailsSerialize====================
class Match___Serializer1(serializers.ModelSerializer):
    select_league=League_serializers()
    class Meta:
        model = Match
        fields = ['id','select_league','match_display_name']

class AddPool__Serializer1(serializers.ModelSerializer):
    class Meta:
        model = Add_Pool
        fields = ['id', 'pool_name']

class UserSerializer1(serializers.ModelSerializer):
    class Meta:
        model = user
        fields = ['name']

class PlayerSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', "team_name",'player_name', 'player_short_name', 'player_image','run']



# class view_contest_details_Serializer(serializers.ModelSerializer):
#     match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.all(), required=False, allow_null=True)
#     pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.all(), allow_null=True, required=False)
#     user_data = serializers.SlugRelatedField(slug_field='name', queryset=user.objects.all(), allow_null=True, required=False)
#     player_pair = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
#     refund = serializers.BooleanField(required=False)  # Add the BooleanField here

#     class Meta:
#         model = view_contest_details
#         fields = ['id', 'match', 'pool_name', 'user_data', 'player_pair', 'amount', 'refund']

#     def create(self, validated_data):
#         # Manually handle the many-to-many field
#         players_data = validated_data.pop('player_pair', [])
#         refund = validated_data.pop('refund', True)  # Default to True if not provided
#         match = view_contest_details.objects.create(**validated_data, refund=refund)
#         match.player_pair.set(players_data)
#         return match

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation['match'] = Match___Serializer1(instance.match).data if instance.match else None
#         representation['pool_name'] = AddPool__Serializer1(instance.pool_name).data if instance.pool_name else None
#         representation['user_data'] = UserSerializer1(instance.user_data).data if instance.user_data else None

#         representation["player_pair"] = [
#             {
#                 "player_name": player.player_name,
#                 "total_run": player.total_run,
#                 "player_image": player.player_image.url if player.player_image else None
#             } for player in instance.player_pair.all()
#         ]

#         return representation

#     def update(self, instance, validated_data):
#         # Pop out the player_pair and refund data
#         player_pair_data = validated_data.pop('player_pair', [])
#         refund = validated_data.pop('refund', instance.refund)  # Use existing refund value if not provided

#         # Update other fields
#         instance.match = validated_data.get('match', instance.match)
#         instance.pool_name = validated_data.get('pool_name', instance.pool_name)
#         instance.user_data = validated_data.get('user_data', instance.user_data)
#         instance.amount = validated_data.get('amount', instance.amount)
#         instance.refund = refund

#         # Save instance before updating many-to-many field
#         instance.save()

#         # Update many-to-many field using .set()
#         instance.player_pair.set(player_pair_data)

#         return instance



#22222222222222222222222222
class view_contest_details_Serializer(serializers.ModelSerializer):
    match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.all(), required=False, allow_null=True)
    pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), allow_null=True, required=False)
    user_data = serializers.SlugRelatedField(slug_field='name', queryset=user.objects.all(), allow_null=True, required=False)
    player_pair = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
    refund = serializers.BooleanField(required=False)  # Add the BooleanField here
    def __init__(self, *args, **kwargs):
        super(view_contest_details_Serializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('pool_name')
            match_display_name = data.get('match')

            if league_name:
                # Filter pool_name queryset based on the league_name provided in the input data
                self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,select_match__match_display_name=match_display_name)

    class Meta:
        model = view_contest_details
        fields = ['id', 'match', 'pool_name', 'user_data', 'player_pair', 'amount', 'refund']

    def create(self, validated_data):
        # Manually handle the many-to-many field
        players_data = validated_data.pop('player_pair', [])
        refund = validated_data.pop('refund', True)  # Default to True if not provided
        match = view_contest_details.objects.create(**validated_data, refund=refund)
        match.player_pair.set(players_data)
        return match

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['match'] = Match___Serializer1(instance.match).data if instance.match else None
        representation['pool_name'] = AddPool__Serializer1(instance.pool_name).data if instance.pool_name else None
        representation['user_data'] = UserSerializer1(instance.user_data).data if instance.user_data else None

        representation["player_pair"] = [
            {
                "player_name": player.player_name,
                "total_run": player.total_run,
                "player_image": player.player_image.url if player.player_image else None
            } for player in instance.player_pair.all()
        ]

        return representation

    def update(self, instance, validated_data):
        # Pop out the player_pair and refund data
        player_pair_data = validated_data.pop('player_pair', [])
        refund = validated_data.pop('refund', instance.refund)  # Use existing refund value if not provided

        # Update other fields
        instance.match = validated_data.get('match', instance.match)
        instance.pool_name = validated_data.get('pool_name', instance.pool_name)
        instance.user_data = validated_data.get('user_data', instance.user_data)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.refund = refund

        # Save instance before updating many-to-many field
        instance.save()

        # Update many-to-many field using .set()
        instance.player_pair.set(player_pair_data)

        return instance






# ==================================  all_match_serializer ====================
class Player__Serializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['player_name','player_image']
class PoolDeclareSerializer(serializers.ModelSerializer):

    class Meta:
        model = Pool_Declare
        fields = ["id","player_declare","total_run"]



#77777777777777777777777777777777777777777777777777777777777777
# class all_match_serializer(serializers.Serializer):
#     id = serializers.IntegerField(required=False)
#     username = serializers.SlugRelatedField(slug_field='name', queryset=user.objects.all(), required=True)
#     player = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), many=True, required=False, allow_null=True)
#     pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.all(), required=True)
#     score = serializers.IntegerField()
#     invest_amount = serializers.IntegerField()
#     multi_x = serializers.IntegerField()
#     total_amount = serializers.IntegerField()
#     captain = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), required=False, allow_null=True)
#     vice_captain = serializers.SlugRelatedField(slug_field='player_name', queryset=Player.objects.all(), required=False, allow_null=True)

#     def create(self, validated_data):
#         players_data = validated_data.pop('player', [])
#         match = all_match_details.objects.create(**validated_data)
#         match.player.set(players_data)
#         # Update the total_run for each player here if required
#         for player in players_data:
#             player_instance = Player.objects.get(id=player.id)
#             # Perform any logic to update player.total_run here
#             # Example: player_instance.total_run += some_value
#             player_instance.save()
#         return match

#     def update(self, instance, validated_data):
#         players_data = validated_data.pop('player', [])
#         instance = super().update(instance, validated_data)
#         if players_data:
#             instance.player.set(players_data)
#             for player in players_data:
#                 player_instance = Player.objects.get(id=player.id)
#                 # Update total_run for each player in the player list
#                 # Example: player_instance.total_run += some_value
#                 player_instance.save()
#         return instance

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation["username"] = user_serializers(instance.username).data if instance.username else None
#         representation["captain"] = {
#             "player_name": instance.captain.player_name,
#             "team_name": instance.captain.team_name.team_name,
#             "total_run": instance.captain.total_run,
#             "player_image": instance.captain.player_image.url if instance.captain.player_image else None
#         } if instance.captain else None
#         representation["vice_captain"] = {
#             "player_name": instance.vice_captain.player_name,
#             "team_name": instance.vice_captain.team_name.team_name,
#             "total_run": instance.vice_captain.total_run,
#             "player_image": instance.vice_captain.player_image.url if instance.vice_captain.player_image else None
#         } if instance.vice_captain else None
#         representation["player"] = [
#             {
#                 "team_name": player.team_name.team_name,
#                 "id": player.id,
#                 "player_name": player.player_name,
#                 "total_run": player.total_run,
#                 "player_image": player.player_image.url if player.player_image else None,
#                 "match_captain": None,
#                 "match_vice_captain": None
#             } for player in instance.player.all()
#         ]
#         representation["score"] = sum(player['total_run'] for player in representation["player"])

#         captain_id = instance.captain.id if instance.captain else None
#         vice_captain_id = instance.vice_captain.id if instance.vice_captain else None
#         for player in representation['player']:
#             player['match_captain'] = (player['id'] == captain_id)
#             player['match_vice_captain'] = (player['id'] == vice_captain_id)

#         return representation




#=================class all_match_serializer(serializers.Serializer):
import json
class PlayerPairSerializer123(serializers.Serializer):
    player_id = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all())
    run = serializers.IntegerField()


class all_match_serializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    user_data= serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=True)
    player = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False,allow_empty=False)
    pool_id = serializers.IntegerField()
    pool_name = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.none(), required=True)
    pool_type = serializers.CharField(max_length=500,required=False)
    score = serializers.FloatField()
    invest_amount = serializers.IntegerField()
    multi_x = serializers.FloatField()
    total_amount = serializers.IntegerField()
    captain = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), required=False, allow_null=True)
    vice_captain = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), required=False, allow_null=True)
    match_status=serializers.CharField(max_length=500,read_only=True)

    match = serializers.SlugRelatedField(slug_field='match_display_name', queryset=Match.objects.all(), required=False, allow_null=True)
    players_score = PlayerPairSerializer123(many=True, write_only=True,required=False)
    winning_status = serializers.CharField(max_length=500, required=False)
    disable_user = serializers.BooleanField(default=False)

    def __init__(self, *args, **kwargs):
        super(all_match_serializer, self).__init__(*args, **kwargs)

        if 'data' in kwargs:
            data = kwargs['data']
            league_name = data.get('pool_name')
            match_display_name = data.get('match')
            pool_type = data.get('pool_type')

            if league_name:
                # Filter pool_name queryset based on the league_name provided in the input data
                self.fields['pool_name'].queryset = Add_Pool.objects.filter(pool_name=league_name,pool_type=pool_type,select_match__match_display_name=match_display_name)

    def create(self, validated_data):
        players_data = validated_data.pop('player', [])
        players_data1 = validated_data.pop('players_score', [])
        pairs = [
            {

                'player_id': player_data12['player_id'].id,

                'run': player_data12['run']
            }
            for player_data12 in players_data1
        ]
        match = all_match_details.objects.create(**validated_data,players_score=json.dumps(pairs))

        match.player.set(players_data)
        # Update the total_run for each player here if required
        for player in players_data:
            player_instance = Player.objects.get(id=player.id)
            # Perform any logic to update player.total_run here
            # Example: player_instance.total_run += some_value
            player_instance.save()
        return match

    def update(self, instance, validated_data):
            # Update the fields in the instance with the validated data
            instance.user_data = validated_data.get('user_data', instance.user_data)
            instance.pool_id = validated_data.get('pool_id', instance.pool_id)
            instance.pool_name = validated_data.get('pool_name', instance.pool_name)
            instance.match = validated_data.get('match', instance.match)
            instance.score = validated_data.get('score', instance.score)
            instance.invest_amount = validated_data.get('invest_amount', instance.invest_amount)
            instance.multi_x = validated_data.get('multi_x', instance.multi_x)
            instance.total_amount = validated_data.get('total_amount', instance.total_amount)
            instance.captain = validated_data.get('captain', instance.captain)
            instance.vice_captain = validated_data.get('vice_captain', instance.vice_captain)
            instance.pool_type = validated_data.get('pool_type', instance.pool_type)
            instance.winning_status = validated_data.get('winning_status', instance.winning_status)
            instance.disable_user = validated_data.get('disable_user', instance.disable_user)
            # Update player set
            players_data = validated_data.get('player', [])
            if players_data:
                instance.player.set(players_data)
            players_data1 = validated_data.pop('players_score', [])
            if players_data1:
                pairs = [
                    {

                        'player_id': player_data12['player_id'].id,
                        'run': player_data12['run']
                    }
                    for player_data12 in players_data1
                ]
                instance.players_score = json.dumps(pairs)
                # Save the instance after all changes
                instance.save()

            # Optionally update the total_run for each player here if required
            for player in players_data:
                player_instance = Player.objects.get(id=player.id)
                # Perform any logic to update player.total_run here if required
                # Example: player_instance.total_run += some_value
                player_instance.save()
            instance.save()
            return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user_data"] = user_serializers(instance.user_data).data if instance.user_data else None
        representation["match"] = Match___Serializer(instance.match).data if instance.match else None
        
        match_representation = MatchSerializer(instance.match).data if instance.match else None
        representation["match"] = match_representation

        # Get disabled players from match_representation
        disable_player_A = match_representation.get("disable_player_A", []) if match_representation else []
        disable_player_B = match_representation.get("disable_player_B", []) if match_representation else []
        
        
        # representation["pool_name"] = AddPool__Serializer1(instance.pool_name).data if instance.pool_name else None
        representation["captain"] = {
            "player_name": instance.captain.player_name,
            "team_name": instance.captain.team_name.team_name,
            "total_run": instance.captain.total_run,
            "player_image": instance.captain.player_image.url if instance.captain.player_image else None
          
        } if instance.captain else None
        representation["vice_captain"] = {
            "player_name": instance.vice_captain.player_name,
            "team_name": instance.vice_captain.team_name.team_name,
            "total_run": instance.vice_captain.total_run,
            "player_image": instance.vice_captain.player_image.url if instance.vice_captain.player_image else None
            
        } if instance.vice_captain else None
        representation["player"] = [
            {
                "team_name": player.team_name.team_name,
                "id": player.id,
                "player_name": player.player_name,
                "total_run": player.total_run,
                "player_image": player.player_image.url if player.player_image else None,
                "match_captain": None,
                "match_vice_captain": None,
                  "status": 'disable' if any(disable_player['id'] == player.id for disable_player in disable_player_A) or 
                  any(disable_player['id'] == player.id for disable_player in disable_player_B) 
                  else 'enable'
            } for player in instance.player.all()
        ]
        # representation["score"] = sum(player['total_run'] for player in representation["player"])
        try:
            player_pairs = json.loads(instance.players_score)
            representation['players_score'] = [
                {
                    'player_id': PlayerSerializer(Player.objects.get(id=pair['player_id'])).data,
                    'run': pair['run']
                }
                for pair in player_pairs
            ]
        except:
            representation['players_score'] = []
        captain_id = instance.captain.id if instance.captain else None
        vice_captain_id = instance.vice_captain.id if instance.vice_captain else None
        for player in representation['player']:
            player['match_captain'] = (player['id'] == captain_id)
            player['match_vice_captain'] = (player['id'] == vice_captain_id)

        return representation





#=======================AddAmountSerializer============
class AddAmountSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    add_amount = serializers.IntegerField(default=0)
    total_amount = serializers.FloatField(default=0)

    class Meta:
        model = Add_Amount
        fields = '__all__'
        exclude = ('id',)

    def create(self, validated_data):
        return Add_Amount.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.add_amount = validated_data.get('add_amount', instance.add_amount)
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.save()
        return instance
#===========Wallet_serializer===============
class Wallet_serializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    user_id = serializers.CharField(max_length=300,source="Player_ID")
    user_name = serializers.CharField(max_length=300,source="Player_Name")
    total_wallet = serializers.FloatField(default=0.0)
    total_bonus = serializers.FloatField(default=0.0)
    add_bonus = serializers.FloatField(default=0.0)
    

    class Meta:

        model = Wallet
        fields = "__all__"
        exculde = ('id',)

    def create(self, validated):
        return Wallet.objects.create(**validated)

    def update(self, instance, validated_data):

        instance.Player_ID = validated_data.get('Player_ID',instance.Player_ID)
        instance.Player_Name = validated_data.get('Player_Name',instance.Player_Name)
        instance.total_wallet = validated_data.get('total_wallet',instance.total_wallet)
        instance.total_bonus = validated_data.get('total_bonus',instance.total_bonus)
        instance.add_bonus = validated_data.get('add_bonus',instance.add_bonus)

        instance.save()

        return instance


#================Wallet_transactions_serializer===========
class Wallet_transactions_serializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    username = serializers.CharField(max_length=500)
    mobile_no = serializers.IntegerField()
    transactions_id = serializers.CharField(max_length=500)
    mode = serializers.CharField(max_length=500)
    amount = serializers.FloatField()
    status = serializers.CharField(max_length=500)
    credit_debit = serializers.CharField(max_length=500)
    date_time = serializers.DateTimeField(read_only=True)


    class Meta:

        model = Wallet_transactions
        fields = "__all__"
        exculde = ('id',)

    def create(self, validated):
        return Wallet_transactions.objects.create(**validated)

    def update(self, instance, validated_data):

        instance.username = validated_data.get('username',instance.username)
        instance.mobile_no = validated_data.get('mobile_no',instance.mobile_no)
        instance.transactions_id = validated_data.get('transactions_id',instance.transactions_id)
        instance.mode = validated_data.get('mode',instance.mode)
        instance.amount = validated_data.get('amount',instance.amount)
        instance.status = validated_data.get('status',instance.status)
        instance.credit_debit = validated_data.get('credit_debit',instance.credit_debit)
        instance.save()

        return instance



# -----------------All_Transcrion_serializer--------------------------------------------

import pytz

class All_Transcrion_serializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    user_id = serializers.CharField(max_length=500)
    order_id = serializers.CharField(max_length=500)
    amount = serializers.FloatField()
    status = serializers.CharField(max_length=500)
    credit_debit = serializers.CharField(max_length=50)
    date_time = serializers.SerializerMethodField(read_only=True)


    class Meta:

        model = All_Transcrion
        fields = "__all__"
        exculde = ('id',)

    def get_date_time(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.date_time.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')


    def create(self, validated):
        return All_Transcrion.objects.create(**validated)

    def update(self, instance, validated_data):

        instance.user_id = validated_data.get('user_id',instance.user_id)
        instance.order_id = validated_data.get('order_id',instance.order_id)
        instance.amount = validated_data.get('amount',instance.amount)
        instance.status = validated_data.get('status',instance.status)
        instance.credit_debit = validated_data.get('credit_debit',instance.credit_debit)

        instance.save()

        return instance


# ---------------------------Withdraw History------------------------------

class Withdraw_history_serializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    Player_Name = serializers.CharField(max_length=300)
    Payment_Method = serializers.CharField(max_length=300)
    Account = serializers.CharField(max_length=300)
    Amount = serializers.FloatField(default=0.0)
    Status = serializers.CharField(max_length=300)
    Action = serializers.CharField(max_length=300,default="check")


    class Meta:

        models = Withdraw_history
        fields = "__all__"
        exculde = ('id',)

    def create(self, validated):
        return Withdraw_history.objects.create(**validated)


    def update(self, instance, validated_data):
        instance.Player_Name = validated_data.get('Player_Name',instance.Player_Name)
        instance.Payment_Method = validated_data.get('Payment_Method',instance.Payment_Method)
        instance.Account = validated_data.get('Account',instance.Account)
        instance.Amount = validated_data.get('Amount',instance.Amount)
        instance.Status = validated_data.get('Status',instance.Status)
        instance.Action = validated_data.get('Action',instance.Action)

        instance.save()

        return instance





#===============================game_amount_serializer=======================
class Add_Pool_Serializer(serializers.ModelSerializer):
    class Meta:
        model=Add_Pool
        fields=["pool_name","pool_type"]


class user__serializers(serializers.ModelSerializer):
    class Meta:
        model=user
        fields=["name","email","mobile_no"]


class game_amount_serializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    username = serializers.SlugRelatedField(slug_field='name', queryset=user.objects.all(), required=True)
    pool = serializers.SlugRelatedField(slug_field='pool_name', queryset=Add_Pool.objects.all(), required=True)
    transactions_id = serializers.CharField(max_length=500)
    credit_debit = serializers.CharField(max_length=500)
    amount = serializers.FloatField()
    status = serializers.CharField(max_length=500)
    date_time = serializers.SerializerMethodField(read_only=True)


    class Meta:

        model = game_amount
        fields = "__all__"
        exculde = ('id',)

    def get_date_time(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.date_time.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["username"] = user__serializers(instance.username).data if instance.username else None
        representation["pool"] =Add_Pool_Serializer(instance.pool).data if instance.pool else None
        return representation

    def create(self, validated):
        return game_amount.objects.create(**validated)

    def update(self, instance, validated_data):

        instance.username = validated_data.get('username',instance.username)
        instance.pool = validated_data.get('pool',instance.pool)
        instance.transactions_id = validated_data.get('transactions_id',instance.transactions_id)
        instance.credit_debit = validated_data.get('credit_debit',instance.credit_debit)
        instance.amount = validated_data.get('amount',instance.amount)
        instance.status = validated_data.get('status',instance.status)

        instance.save()

        return instance

#=====================================
class UserStoreTeamSerializer(serializers.ModelSerializer):
    user_data = serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=True)
    player_data = serializers.SlugRelatedField(slug_field='id', queryset=Player.objects.all(), many=True, required=False, allow_null=True)



    class Meta:
        model = User_store_team
        fields = ['id','user_data', 'player_data']




    def create(self, validated_data):
        players_data = validated_data.pop('player_data', [])

        user_store_team = User_store_team.objects.create(**validated_data)
        user_store_team.player_data.set(players_data)

        user_store_team.save()
        return user_store_team



    def update(self, instance, validated_data):
        players_data = validated_data.pop('player_data', [])
        instance.user_data = validated_data.get('user_data', instance.user_data)
        instance.player_data.set(players_data)

        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["user_data"] = user_serializers(instance.user_data).data if instance.user_data else None
        representation["player_data"] = [
                    {
                        "id": player.id,
                        "player_name": player.player_name
                    } for player in instance.player_data.all()
                ] if instance.player_data.exists() else []

        return representation



#-----------------------------------------------------------------------------------
class send_otp_serializers(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    phone_number = serializers.CharField(max_length=20,required=True)

    class Meta:
        models=send_otp
        fields ='__all__'
        exclude = ('id',)

    def create(self, validated_data):
        return send_otp.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.phone_number=validated_data.get('phone_number',instance.phone_number)

        instance.save()
        return instance






class ad_serializers(serializers.ModelSerializer):
    class Meta:
        model = ad
        fields = ['id', 'file', 'type']

    def create(self, validated_data):
        # Handle file upload in the create method
        ad_instance = ad.objects.create(**validated_data)
        return ad_instance

    def update(self, instance, validated_data):
        # Handle file upload in the update method
        instance.file = validated_data.get('file', instance.file)
        instance.type = validated_data.get('type', instance.type)
        instance.save()
        return instance


import os
import ast
from django.conf import settings
class AdSerializer1(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True
    )
    index=serializers.IntegerField(required=False)
    remove_index=serializers.IntegerField(required=False)

    class Meta:
        model = Ad1
        fields = ['id', 'image_list', 'images','index','remove_index']
        read_only_fields = ['image_list']

    def create(self, validated_data):
        images = validated_data.pop('images')
        ad = Ad1.objects.create()
        image_paths = []
        for image in images:
            image_path=self.save_image(image)


            image_paths.append(image_path)
        ad.image_list = image_paths
        ad.save()
        return ad
    def update(self, instance, validated_data):
        images = validated_data.pop('images', [])
        index_to_update = validated_data.get('index')
        remove_index = validated_data.get('remove_index')
        print(images)
        print(index_to_update)
        print(remove_index)
        if images and index_to_update is not None:
            print("ok")
            image_paths = instance.image_list or []
            for image in images:
                image_path = self.save_image(image)
                image_paths[index_to_update]=image_path
            instance.image_list = image_paths
        elif remove_index is not None:
            print(len(instance.image_list),"done")
            l1=instance.image_list
            l1.pop(remove_index)

        elif images :
            image_paths = instance.image_list or []
            for image in images:
                image_path = self.save_image(image)
                image_paths.append(image_path)
            instance.image_list = image_paths
        instance.save()
        return instance

    def save_image(self, image):
        image_path1 = "video/"
        image_name = image.name
        image_path = os.path.join(image_path1, image_name)

        # Save the file to the media directory
        full_image_path = os.path.join(settings.MEDIA_ROOT, image_path)
        with open(full_image_path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)

        return image_path





class ScrachCouponSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    # user_data = serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=True)
    image=serializers.ImageField(required=False)
    coupon_point = serializers.CharField(max_length=50,required=True)

    class Meta:
        model = Scrach_coupon
        fields = ['id','image','coupon_point']


    def create(self, validated_data):
        return Scrach_coupon.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # instance.user_data=validated_data.get('user_data',instance.user_data)
        instance.image=validated_data.get('image',instance.image)
        instance.coupon_point=validated_data.get('coupon_point',instance.coupon_point)

        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # representation["user_data"] = user_serializers(instance.user_data).data if instance.user_data else None
        return representation


# ========================== notification =========================

class user_data_notification(serializers.ModelSerializer):
    class Meta:
        model = user
        fields = ['user_id','name','image']


class NotificationSerializer(serializers.ModelSerializer):
    user_data= serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=True,many=True)
    timestamp = serializers.SerializerMethodField()
    read=serializers.ListField(child=serializers.CharField(max_length=100), required=False, allow_null=True)
    class Meta:
        model = notification
        fields = ['id', 'user_data', 'message', 'title', 'read', 'timestamp']
        read_only_fields = ['timestamp']
    def get_timestamp(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.timestamp.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')
    def create(self, validated_data):
        user_data_1 = validated_data.pop('user_data', [])
        read = validated_data.pop('read', [])
        noti=notification.objects.create(**validated_data)
        noti.user_data.set(user_data_1)
        if read:
            noti.read = read
        noti.save()
        return noti
    def update(self, instance, validated_data):
        user_data_1 = validated_data.pop('user_data', [])
        if user_data_1:
                        
            instance.user_data.set(user_data_1)
        # instance.user_data.set(user_data_1)
        instance.message=validated_data.get('message',instance.message)
        instance.title=validated_data.get('title',instance.title)
        instance.read=validated_data.get('read',instance.read)
        read = validated_data.get('read', [])
        if read:
            instance.read = list(read)
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user_data"] = user_data_notification(instance.user_data,many=True).data
        # read_note_ids = instance.read if instance.read is not None else []
        # for user in representation["user_data"]:
        #     if user["user_id"] in read_note_ids:
        #         user["read"] = True  
        #     else:
        #         user["read"] = False
        read_note_ids = instance.read if instance.read is not None else []

        for user in representation["user_data"]:
            user["read"] = user["user_id"] in read_note_ids

        # Explicitly set read to an empty list if it is None
        representation["read"] = read_note_ids if instance.read is not None else []
        return representation




#==================================================================
class ReferralSerializer(serializers.ModelSerializer):
    user_data= serializers.SlugRelatedField(slug_field='referred_code', queryset=user.objects.all(), required=True)
    referred_user= serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=False)
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = notification
        fields = ['id', 'user_data', 'referred_user', 'read', 'timestamp']
        read_only_fields = ['timestamp']

    def get_timestamp(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.timestamp.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')

    def create(self, validated_data):
        return referral.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.user_data=validated_data.get('user_data',instance.user_data)
        instance.referred_user=validated_data.get('referred_user',instance.referred_user)
        instance.read=validated_data.get('read',instance.read)
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user_data"] = user_data_notification(instance.user_data).data
        representation["referred_user"] = user_data_notification(instance.referred_user).data if instance.referred_user else None
        return representation
        
        
# ====================== 

class User_Doc_Serializer1(serializers.Serializer):
    
    account_number=serializers.IntegerField(required=False)
    ifsc_code=serializers.CharField(max_length=200,required=False)
    bank_name=serializers.CharField(max_length=200,required=False)
    branch_name=serializers.CharField(max_length=200,required=False)
   
    class Meta:
        models = user_document
        fields =['account_number','ifsc_code','bank_name','branch_name']
        exclude = ('id',) 
#===============
class user_data_notification1(serializers.ModelSerializer):
    user_doc = User_Doc_Serializer1(required=False)
    class Meta:
        model = user
        fields = ['user_id','name','mobile_no','email','image','user_doc','winning_amount','wallet_amount',"bonus_amount","referral_amount"]
#====================
class Withdraw_amount_Serializer(serializers.ModelSerializer):
    user_data= serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=True)
    amount_without_tds=serializers.IntegerField(required=False)
    tds=serializers.IntegerField(required=False)
    amount_with_tds=serializers.IntegerField(required=False)
    withdraw_status=serializers.CharField(max_length=200,required=False)
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Withdraw_amount
        fields = '__all__'
        read_only_fields = ['timestamp']

    def get_timestamp(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.timestamp.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S') 
    def create(self, validated_data):
        return Withdraw_amount.objects.create(**validated_data)
    
    
    def update(self, instance, validated_data):
        instance.user_data=validated_data.get('user_data',instance.user_data)
        instance.amount_without_tds=validated_data.get('amount_without_tds',instance.amount_without_tds)
        instance.tds=validated_data.get('tds',instance.tds)
        instance.amount_with_tds=validated_data.get('amount_with_tds',instance.amount_with_tds)
        instance.withdraw_status=validated_data.get('withdraw_status',instance.withdraw_status)
        instance.save()
        return instance    

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user_data"] = user_data_notification1(instance.user_data).data 

        
        return representation 
        
        
#==================================================================



import json
from datetime import datetime
import pytz  # Ensure pytz is imported for timezone handling

class WordsField(serializers.Field):
    def to_representation(self, value):
        # Convert JSON string to Python list of dictionaries
        try:
            words_list = json.loads(value)
        except (TypeError, ValueError):
            words_list = []

        # Ensure the ordering of fields with `id` appearing before `book_page`
        for word in words_list:
            ordered_word = {}
            if 'id' in word:
                ordered_word['id'] = word.pop('id')  # Add `id` first
            if 'book_page' in word:
                ordered_word['book_page'] = word.pop('book_page')  # Add `book_page` next
            ordered_word.update(word)  # Add the remaining fields
            word.clear()
            word.update(ordered_word)

        return words_list

    def to_internal_value(self, data):
        # Allowed keys for each word entry
        allowed_keys = {'msg', 'timestamp'}

        if isinstance(data, list):
            # Retrieve existing data
            existing_data = self.parent.instance.message if self.parent.instance and self.parent.instance.message else "[]"
            try:
                existing_data_list = json.loads(existing_data)
            except (TypeError, ValueError):
                existing_data_list = []

            # Determine the current maximum id (replacing index)
            max_id = max((entry.get('id', 0) for entry in existing_data_list), default=0)

            updated_data = existing_data_list
            for word in data:
                if not isinstance(word, dict):
                    raise serializers.ValidationError("Each item in the list must be a dictionary.")
                if not allowed_keys.issuperset(word.keys()):
                    raise serializers.ValidationError(f"Only these fields are allowed: {allowed_keys}")

                # Auto-generate 'id' as a unique ID
                max_id += 1
                word['id'] = max_id

                # Add timestamp if not present
                if 'timestamp' not in word:
                    local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired timezone
                    word['timestamp'] = datetime.now(local_tz).strftime('%Y-%m-%d %H:%M:%S')

                updated_data.append(word)

            try:
                value = json.dumps(updated_data)
            except (TypeError, ValueError):
                raise serializers.ValidationError("Invalid format for words.")
        else:
            raise serializers.ValidationError("Expected a list of dictionaries.")
        return value




class user_query_show(serializers.ModelSerializer):
    address = AddressSerializer()
    class Meta:
        model = user
        fields = ['user_id','name','address','email','mobile_no']

class User_Query_Serializer(serializers.ModelSerializer):
    user_data= serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=True)
    message=WordsField()
    

    class Meta:
        model=user_query
        fields ='__all__'
 
    def create(self, validated_data):
        return user_query.objects.create(**validated_data)  
    def update(self, instance, validated_data): 
        instance.user_data=validated_data.get('user_data',instance.user_data)
        instance.message=validated_data.get('message',instance.message)

       
        instance.save()
        return instance  

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user_data"] = user_query_show(instance.user_data).data
        return representation      
     
     
     
     

#=================payment_Serializer======================
#===================
class User_Doc_Serializer1(serializers.Serializer):
    
    account_number=serializers.IntegerField(required=False)
    ifsc_code=serializers.CharField(max_length=200,required=False)
    bank_name=serializers.CharField(max_length=200,required=False)
    branch_name=serializers.CharField(max_length=200,required=False)
   
    class Meta:
        models = user_document
        fields =['account_number','ifsc_code','bank_name','branch_name']
        exclude = ('id',) 
#===============
class user_payment_show(serializers.ModelSerializer):
    user_doc = User_Doc_Serializer1(required=False)
    class Meta:
        model = user
        fields = ['user_id','name','mobile_no','email','image','user_doc','wallet_amount','deposit_amount']


class payment_Serializer(serializers.ModelSerializer):
    user_data= serializers.SlugRelatedField(slug_field='user_id', queryset=user.objects.all(), required=False)
    payment_screenshot=serializers.ImageField(required=False)
    paid_amount=serializers.IntegerField(required=False)
    timestamp = serializers.SerializerMethodField()
    payment_status=serializers.CharField(max_length=200,required=False)

    class Meta:
        model = payment
        fields = '__all__'
        read_only_fields = ['timestamp']

    def get_timestamp(self, obj):
        local_tz = pytz.timezone('Asia/Kolkata')  # Set to your desired time zone
        local_dt = obj.timestamp.astimezone(local_tz)
        return local_dt.strftime('%Y-%m-%d %H:%M:%S')  
        
    def create(self, validated_data):
        return payment.objects.create(**validated_data)    
    
    def update(self, instance, validated_data): 
        instance.user_data=validated_data.get('user_data',instance.user_data)
        instance.payment_screenshot=validated_data.get('payment_screenshot',instance.payment_screenshot)
        instance.paid_amount=validated_data.get('paid_amount',instance.paid_amount)
        instance.payment_status=validated_data.get('payment_status',instance.payment_status)
        
        
        instance.save()
        return instance
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user_data"] = user_payment_show(instance.user_data).data
        return representation
