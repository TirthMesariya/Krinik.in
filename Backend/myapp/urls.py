"""
URL configuration for My_Project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import*
from . import views
urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),
    path('Faq', views.Faq, name='Faq'),
    path('footcopy', views.footcopy, name='footcopy'),
    path('Privacypolicy', views.Privacypolicy, name='Privacypolicy'),
    path('Refundpolicy', views.Refundpolicy, name='Refundpolicy'),
    path('termandconditions', views.termandconditions, name='termandconditions'),
    # path('get/', League_view.as_view()),
    # path('get/<int:id>/', League_view.as_view()),

    ##------LEAGUE_GET-----------
    path('league_get/', League_view.as_view()),
    path('league_get/<int:id>/', League_view.as_view()),


    ##------TEAM_GET-----------
    path('team_get/', Team_view.as_view()),
    path('team_get/<int:id>/', Team_view.as_view()),

    ##------PLAYER_GET-----------
    path('player_get/', Player_view.as_view()),
    path('player_get/<int:id>/', Player_view.as_view()),


    ##------POOL_GET-----------
    path('pool_get/', pool_view.as_view()),
    path('pool_get/<int:id>/', pool_view.as_view()),

   ##------PAIR_GET-----------
    path('pair_get/', Pair_view.as_view()),
    path('pair_get/<int:id>/', Pair_view.as_view()),

    path('pair_get/pool_id/<int:pool_id>/', Pair_view.as_view()),
    path('pair_get/pool_id/<int:pool_id>/player1/<int:player_id1>/player2/<int:player_id2>/', Pair_view.as_view()),
    
    ##------PAIR_GET_CAPTAIN-----------
    path('pair_captain_get/', Pair_with_captain_view.as_view()),
    path('pair_captain_get/<int:id>/', Pair_with_captain_view.as_view()),

    path('pair_captain_get/pool_id/<int:pool_id>/', Pair_with_captain_view.as_view()),
    
    path('pair_captain_get/pool_id/<int:pool_id>/player1/<int:player_id1>/player2/<int:player_id2>/', Pair_with_captain_view.as_view()),
    
    ##------PAIR_GET_CAPTAIN_AND_VICE_CAPTAIN-----------
    path('pair_captain_v_get/', Pair_with_captain_v_captain_view.as_view()),
    path('pair_captain_v_get/<int:id>/', Pair_with_captain_v_captain_view.as_view()),

    path('pair_captain_v_get/pool_id/<int:pool_id>/', Pair_with_captain_v_captain_view.as_view()),
    path('pair_captain_v_get/pool_id/<int:pool_id>/player1/<int:player_id1>/player2/<int:player_id2>/player3/<int:player_id3>/', Pair_with_captain_v_captain_view.as_view()),
    
    #=================
    path('new_get/', new_view.as_view()),
    path('new_get/<int:id>/', new_view.as_view()),

    ##------MATCH_GET-----------
    path('match_get/', match_view.as_view()),
    path('match_get/<int:id>/', match_view.as_view()),


    #--------ADD_POOL GET------------------
    path('add_pool_get/', Add_pool_view.as_view()),
    path('add_pool_get/<int:id>/', Add_pool_view.as_view()),
    path('add_pool_get/pool_id/<int:id>/', Add_pool_view.as_view()),
    path('add_pool_get/match_id/<int:match_id>/', Add_pool_view.as_view()),


     #--------CAPTAIN_ADD_POOL GET------------------
    # path('captain_add_pool_get/', Captain_Add_Pool_view.as_view()),
    # path('captain_add_pool_get/<int:id>/', Captain_Add_Pool_view.as_view()),



     #--------VICE_CAPTAIN_ADD_POOL GET------------------
    # path('vice_captain_add_pool_get/', Vice_Captain_Add_Pool_view.as_view()),
    # path('vice_captain_add_pool_get/<int:id>/', Vice_Captain_Add_Pool_view.as_view()),

    #--------POOL DECLARE GET------------------
    path('pool_declare/', Pool_Declare_view.as_view()),
    path('pool_declare/<int:id>/', Pool_Declare_view.as_view()),
    path('pool_declare/match_id/<int:match_id>/', Pool_Declare_view.as_view()),
    
    
    path('user_get/', user_view.as_view()),
    path('user_get/<str:id>/', user_view.as_view()),

    path('login/', login_view.as_view()),
    path('login/<int:id>/', login_view.as_view()),

    #--------------user_pool_history_get-------------
    path('user_pool_history_get/', user_pool_history_view.as_view()),
    path('user_pool_history_get/<int:id>/', user_pool_history_view.as_view()),



    path('view_contest_details_view_get/', view_contest_details_view.as_view()),
    path('view_contest_details_view_get/<int:id>/', view_contest_details_view.as_view()),

    #--------all_match_get ------------------
    path('user_match_get/', all_match_view.as_view()),
    path('user_match_get/<int:id>', all_match_view.as_view()),

    path('user_match_get/user_id/<str:user_id>/', all_match_view.as_view()),
    path('user_match_get/user_id/<str:user_id>/match_id/<int:match_id>/', all_match_view.as_view()),
    path('user_match_get/match_id/<int:match_id>/', all_match_view.as_view()),
    path('user_match_get/user_id/<str:user_id>/match_id/<int:match_id>/pool_id/<int:pool_id>/', all_match_view.as_view()),
    
     # ---------------------------add amount---------

    # path('add_amount/', views.add_amount, name='add_amount'),
    # path('pay/', views.pay, name='pay')

    path('admin_wallet/', AddAmountView.as_view()),
    path('admin_wallet/<int:id>/', AddAmountView.as_view()), 

    #------------------add_wallet------------------------------
    path('add_wallet/', wallet_view.as_view()),
    path('add_wallet/<str:id>/', wallet_view.as_view()),


    #------------------wallet_transaction------------------------------
    path('wallet_transaction/', wallet_transaction.as_view()),
    path('wallet_transaction/<int:id>/', wallet_transaction.as_view()),


    #------------------all_transaction------------------------------
    path('all_transaction/', all_transaction.as_view()),
    path('all_transaction/<int:id>/', all_transaction.as_view()),

    #------------------withdraw_history------------------------------
    path('withdraw_history/', withdraw_history.as_view()),
    path('withdraw_history/<int:id>/', withdraw_history.as_view()),

    #======================game_amount_get==============

    path('game_amount_get/', game_amount_view.as_view()),
    path('game_amount_get/<int:id>/', game_amount_view.as_view()),

    path('view_player/', player_team.as_view()),
    path('view_player/<int:id>/', player_team.as_view()),


    path('user_store_team_get/', user_store_team_get_view.as_view()),
    path('user_store_team_get/<int:id>/', user_store_team_get_view.as_view()),
#+=======================================
    path('send_otp_get/', send_otp_view.as_view()),
    path('send_otp_get/<int:id>/', send_otp_view.as_view()),

# ================ ad ===========================


    path('ad_get/', ad_view.as_view()),
    path('ad_get/<int:id>/', ad_view.as_view()),


    path('ad_get1/', ad_view1.as_view()),
    path('ad_get1/<int:id>/', ad_view1.as_view()),

    path('scratch_coupon_get/', Scrach_coupon_view.as_view()),
    path('scratch_coupon_get/<int:id>/', Scrach_coupon_view.as_view()),

    path('notification_get/', notification_view.as_view()),
    path('notification_get/<int:id>/', notification_view.as_view()),
    path('notification_get/user_id/<str:user_id>/', notification_view.as_view()),
    #==============================================
    path('referral_get/', referral_view.as_view()),
    path('referral_get/<int:id>/', referral_view.as_view()),

    #=====================================
    path('send_notification', views.send_notification, name='send_notification'),
    
        #==========================
    path('withdraw_amount_get/', Withdraw_amount_views.as_view()),
    path('withdraw_amount_get/<int:id>/', Withdraw_amount_views.as_view()),
    path('withdraw_amount_get/user_id/<str:user_id>/', Withdraw_amount_views.as_view()),
    path('withdraw_amount_get/user_id/<str:user_id>/id/<int:id>/', Withdraw_amount_views.as_view()),
    
    # path('send/', send.as_view()),
    path('user_query_get/', user_query_view.as_view()),
    path('user_query_get/<str:user_id>/', user_query_view.as_view()),
    path('user_query_get/user_id/<str:user_id>/', user_query_view.as_view()),

    
    
    path('payment/', payment_view.as_view()),
    path('payment/<int:id>/', payment_view.as_view()),
    path('payment/user_id/<str:user_id>/', payment_view.as_view()),
    
    
    
    

]




##------PAIR_GET  format for  (post/update) -----------

# {"pool_name": "pool2",
#     "player_1": "rohit",
#     "player_2": "virat",
#     "limit": 3}

#===============
# {"pool_name": "pool4",
# "select_match":"ipl11 vs t11   12/06/2024 20:00",
#     "player_1": "rohit",
#     "player_2": "virat",

#     "limit": 2}

#----------------- PAIR_GET_CAPTAIN_AND_VICE_CAPTAIN------------
# {"pool_name": "dhruvil",
# "select_match":"CSK vs RCB 16-07-2024 12:34",
#     "player_1": "mahendra singh dhoni",
#     "player_2": "virat kohli",
#     "player_3": "ruturaj gaikwad",

#     "limit": 23}
#===============================================
# MATCH_GET format for  (post/update)
# { "select_league":  "abc",
#               "select_team_A":   "ipl",
#             "select_player_A": [ "virat" ],
#             "select_team_B":
#              "tttt",
#             "select_player_B": ["dhoni"
#                ],
#             "match_start_date": "10/06/2024"
#         }
#-------------------------------------------
# MATCH update runs

# {
#     "select_league": "abc",
#     "select_team_A": "ipl",
#     "select_player_A": [
#         {
#             "player_name": "virat",
#             "total_run": 55
#         }
#     ],
#     "select_team_B": "tttt",
#     "select_player_B": [
#         {
#             "player_name": "dhoni",
#             "total_run": 44
#         }
#     ],
#     "match_start_date": "10/06/2024"
# }

#==============================================
# ADD_POOL GET  format for   (post/update)
# {
#     "select_match":"ipl vs tttt",
#     "pool_type": "mmm",
#     "pool_name": "pool1",
#     "price": [
#         200,
#         300,
#         500,
#         600
#     ],
#     "winning_price": 2100,
#     "fantacy_start_date": "20/06/2024",
#     "fantacy_end_date": "30/06/2024"
# }



#==============================================
# Pool_Declare  GET  format for   (post/update)

# {

#             "player_declare": "dhoni" ,
#             "team_declare":"tttt",
#             "total_run": 202
#         }



#=========user_pool_history_get================
# {
#     "match": "ipl11 vs t11   12/06/2024 20:00",
#     "pool_name": "pool1",
#     "user_data": "vidhi",
#     "pool_type": "mmm",
#     "player_pair": [
#       "virat",
#            "dhoni"

#     ],
#     "entry_fee": 500,
#     "winning_amount": 3000
# }



#=================all_match_get==========
#  {

#             "username":"vidhi",
#             "player": [


#                     "dhoni", "rohit"


#             ],
#             "pool_name": "pool1",
#             "score": 99,
#             "invest_amount": 2000,
#             "multi_x": 3900,
#             "total_amount": 7800000,
#             "captain":"dhoni",



#             "vice_captain": "virat"



#         }