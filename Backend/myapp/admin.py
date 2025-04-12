from django.contrib import admin
from .models import*

# Register your models here.
admin.site.register(League)
admin.site.register(Team)
admin.site.register(Player)
# admin.site.register(Pool)
admin.site.register(Pair)
admin.site.register(new)
admin.site.register(Match)
# admin.site.register(Add_Pool)
# admin.site.register(Captain_Add_Pool)
# admin.site.register(Vice_Captain_Add_Pool)
admin.site.register(Pool_Declare)
admin.site.register(Pair_with_captain)
admin.site.register(Pair_with_captain_and_v_captain)

admin.site.register(user)
admin.site.register(login_user)
admin.site.register(user_pool_history)
admin.site.register(view_contest_details)
admin.site.register(all_match_details)
admin.site.register(payment)





#=============payment
admin.site.register(Add_Amount)
#=========Wallet
admin.site.register(Wallet)
#========Wallet_transactions
admin.site.register(Wallet_transactions)
#============All_Transcrion
admin.site.register(All_Transcrion)
#============Withdraw_history
admin.site.register(Withdraw_history)
#============game_amount
admin.site.register(game_amount)


admin.site.register(User_store_team)


admin.site.register(send_otp)



admin.site.register(user_document)

admin.site.register(Scrach_coupon)


admin.site.register(ad)
admin.site.register(Ad1)

admin.site.register(notification)
admin.site.register(referral)
admin.site.register(Withdraw_amount)
admin.site.register(user_query)


