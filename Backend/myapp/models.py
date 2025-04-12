from typing import Any
from django.db import models
from django_mysql.models import ListTextField,ListCharField



# Create your models here.
class League(models.Model):
    league_name=models.CharField(max_length=50,blank=True,null=True)
    short_league_name=models.CharField(max_length=50,blank=True,null=True)
    start_league_date=models.CharField(max_length=50,blank=True,null=True)
    end_league_date=models.CharField(max_length=50,blank=True,null=True)
    league_image=models.ImageField(upload_to="league_image_media")




    def __str__(self):
        return self.league_name




#------Team Models----------

class Team(models.Model):
    league_name=models.ForeignKey(League,on_delete=models.CASCADE)
    team_name=models.CharField(max_length=50,blank=True,null=True)
    team_short_name=models.CharField(max_length=50,blank=True,null=True)
    team_image=models.ImageField(upload_to="league_image_media")
    team_date=models.DateField(auto_now=True)

    def __str__(self):
        return self.team_name



#------Player Models----------


class Player(models.Model):
    league_name=models.ForeignKey(League,on_delete=models.CASCADE)
    team_name=models.ForeignKey(Team,on_delete=models.CASCADE)
    player_name=models.CharField(max_length=50,blank=True,null=True)
    player_short_name=models.CharField(max_length=50,blank=True,null=True)
    player_image=models.ImageField(upload_to="league_image_media")
    total_run=models.IntegerField(blank=True,null=True)
    match_captain=models.CharField(max_length=50,blank=True,null=True)
    match_vice_captain=models.CharField(max_length=50,blank=True,null=True)
    status=models.CharField(default="Unable",max_length=50,blank=True,null=True)
    run=models.IntegerField(blank=True,null=True)



    def __str__(self):
        return self.player_name


#------Pool Models----------


class Pool(models.Model):
    pool_type = models.CharField(max_length=50, blank=True, null=True)
    pool_name = models.CharField(max_length=50, blank=True, null=True)
    entry_fee = models.IntegerField(blank=True, null=True)
    # Uncomment the following line if you want to associate a pool with a league.
    # league_name = models.ForeignKey(League, on_delete=models.CASCADE)
    team_name1 = models.ForeignKey(Team, related_name='team1_pools', on_delete=models.CASCADE,blank=True, null=True)
    player_name1 = models.ManyToManyField(Player, related_name='player1_pools',blank=True, null=True)
    team_name2 = models.ForeignKey(Team, related_name='team2_pools', on_delete=models.CASCADE,blank=True, null=True)
    player_name2 = models.ManyToManyField(Player, related_name='player2_pools',blank=True, null=True)
    start_pool_date=models.CharField(max_length=50,blank=True,null=True)
    end_pool_date=models.CharField(max_length=50,blank=True,null=True)

    league_data=models.ForeignKey(League, related_name='league_pools', on_delete=models.CASCADE,blank=True, null=True)


    def __str__(self):
        return self.pool_name





class new(models.Model):

    widget_group_ids = ListTextField(
            base_field=models.IntegerField(),
            size=100,  # Maximum of 100 ids in list
            blank=True,null=True
        )



class Match(models.Model):
    select_league=models.ForeignKey(League,on_delete=models.CASCADE,blank=True, null=True)

    select_team_A = models.ForeignKey(Team, related_name='team_A', on_delete=models.CASCADE,blank=True, null=True)
    select_player_A = models.ManyToManyField(Player, related_name='select_player_A',blank=True, null=True)

    select_team_B = models.ForeignKey(Team, related_name='team_B', on_delete=models.CASCADE,blank=True, null=True)
    select_player_B = models.ManyToManyField(Player, related_name='select_player_B',blank=True, null=True)

    match_start_date=models.CharField(max_length=50,blank=True,null=True)
    match_end_date=models.CharField(max_length=50,blank=True,null=True)

    match_display_name = models.CharField(max_length=255, blank=True, default='')
    disable_player_A = models.ManyToManyField(Player, related_name='disable_player_list_A',blank=True, null=True)

    disable_player_B = models.ManyToManyField(Player, related_name='disable_player_list_B',blank=True, null=True)
    player_list = ListTextField(base_field=models.IntegerField(),size=100,blank=True,null=True)
    match_end_status = models.CharField(default="Live", max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.match_display_name

    def save(self, *args, **kwargs):

        self.match_display_name = f"{self.select_team_A.team_short_name} vs {self.select_team_B.team_short_name} {self.match_start_date}"
        super().save(*args, **kwargs)



class Add_Pool(models.Model):
    select_match=models.ForeignKey(Match,on_delete=models.CASCADE, blank=True, null=True)
    pool_type = models.CharField(max_length=50, blank=True, null=True)
    pool_name = models.CharField(max_length=50, blank=True, null=True)
    price = ListTextField(base_field=models.IntegerField(),size=100,blank=True,null=True)
    winning_price=models.FloatField()

    fantacy_start_date=models.CharField(max_length=50,blank=True,null=True)
    fantacy_end_date=models.CharField(max_length=50,blank=True,null=True)

    def __str__(self):
        return self.pool_name



#==============Pair Models=======================

class Pair(models.Model):

    pool_name=models.ForeignKey(Add_Pool, on_delete=models.CASCADE,blank=True,null=True)
    pool_type = models.CharField(max_length=50, blank=True, null=True)
    select_match=models.ForeignKey(Match,on_delete=models.CASCADE, blank=True, null=True)
    player_1=models.ForeignKey(Player, related_name='pool_player1', on_delete=models.CASCADE,blank=True,null=True)

    player_2=models.ForeignKey(Player, related_name='pool_player2', on_delete=models.CASCADE,blank=True,null=True)
    limit=models.IntegerField(blank=True,null=True)
    updated_limit=models.IntegerField(default=0)


    def __str__(self):
        return str(self.pool_name)

#=======================Pair_with_captain models===============================
class Pair_with_captain(models.Model):

    pool_name=models.ForeignKey(Add_Pool, on_delete=models.CASCADE,blank=True,null=True)
    pool_type = models.CharField(max_length=50, blank=True, null=True)
    select_match=models.ForeignKey(Match,on_delete=models.CASCADE, blank=True, null=True)
    player_1=models.ForeignKey(Player, related_name='pair_with1', on_delete=models.CASCADE,blank=True,null=True)

    player_2=models.ForeignKey(Player, related_name='pair_with2', on_delete=models.CASCADE,blank=True,null=True)
    limit=models.IntegerField()
    updated_limit = models.IntegerField(default=0)
    def __str__(self):
        return str(self.pool_name)



#==========Pair_with_captain_and_vice_captain models=================
class Pair_with_captain_and_v_captain(models.Model):

    pool_name=models.ForeignKey(Add_Pool, on_delete=models.CASCADE,blank=True,null=True)
    pool_type = models.CharField(max_length=50, blank=True, null=True)

    select_match=models.ForeignKey(Match,on_delete=models.CASCADE, blank=True, null=True)
    player_1=models.ForeignKey(Player, related_name='pair_with_v1', on_delete=models.CASCADE,blank=True,null=True)

    player_2=models.ForeignKey(Player, related_name='pair_with_v2', on_delete=models.CASCADE,blank=True,null=True)
    player_3=models.ForeignKey(Player, related_name='pair_with_v3', on_delete=models.CASCADE,blank=True,null=True)
    limit=models.IntegerField()
    updated_limit = models.IntegerField(default=0)

    def __str__(self):
        return str(self.pool_name)


#================== Captain_Add_Pool Models=================

class Captain_Add_Pool(models.Model):
    select_league = models.ForeignKey(League, on_delete=models.CASCADE, blank=True, null=True)
    select_team_A = models.ForeignKey(Team, related_name='captain_team_A', on_delete=models.CASCADE, blank=True, null=True)
    select_player_A = models.ManyToManyField(Player, related_name='captain_select_player_A', blank=True)
    select_team_B = models.ForeignKey(Team, related_name='captain_team_B', on_delete=models.CASCADE, blank=True, null=True)
    select_player_B = models.ManyToManyField(Player, related_name='captain_select_player_B', blank=True)
    captain = models.ManyToManyField(Player, related_name='captain_name', blank=True)

    match_start_date = models.CharField(max_length=50, blank=True, null=True)
    match_display_name = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return self.match_display_name

    def save(self, *args, **kwargs):
        if not self.match_display_name:
            self.match_display_name = f"{self.select_team_A.team_name} vs {self.select_team_B.team_name}"
        super().save(*args, **kwargs)




#================== Vice_Captain_Add_Pool Models=================



class Vice_Captain_Add_Pool(models.Model):
    select_league = models.ForeignKey(League, on_delete=models.CASCADE, blank=True, null=True)
    select_team_A = models.ForeignKey(Team, related_name='vice_captain_team_A', on_delete=models.CASCADE, blank=True, null=True)
    select_player_A = models.ManyToManyField(Player, related_name='vice_captain_select_player_A', blank=True)
    select_team_B = models.ForeignKey(Team, related_name='vice_captain_team_B', on_delete=models.CASCADE, blank=True, null=True)
    select_player_B = models.ManyToManyField(Player, related_name='vice_captain_select_player_B', blank=True)
    captain = models.ManyToManyField(Player, related_name='main_captain_name', blank=True)
    vice_captain = models.ManyToManyField(Player, related_name='select_vice_captain', blank=True)
    match_start_date = models.CharField(max_length=50, blank=True, null=True)
    match_display_name = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return self.match_display_name

    def save(self, *args, **kwargs):
        if not self.match_display_name:
            self.match_display_name = f"{self.select_team_A.team_name} vs {self.select_team_B.team_name}"
        super().save(*args, **kwargs)


#=================POOL DECLARE MODELS========================
class Pool_Declare(models.Model):
    player_declare=models.ForeignKey(Player, on_delete=models.CASCADE, blank=True, null=True)
    team_declare=models.ForeignKey(Team, on_delete=models.CASCADE, blank=True, null=True)
    total_run=models.IntegerField(blank=True,null=True)
    date_time=models.DateTimeField(auto_now=True,blank=True,null=True)
    pool_name=models.ForeignKey(Add_Pool, on_delete=models.CASCADE,blank=True,null=True)
    select_match=models.ForeignKey(Match,on_delete=models.CASCADE, blank=True, null=True)

    def declare_pool(self):
        if self.select_match:
            # Logic to declare pool
            # Update the status of all related AllMatchDetails instances
            related_match_details = all_match_details.objects.filter(match=self.select_match)
            print(related_match_details)
            related_match_details.update(match_status='completed')
            
            self.select_match.match_end_status = 'completed'
            self.select_match.save()
            
            
    def save(self, *args, **kwargs):
        # if self.pool_name :
        #     self.multi_x = self.pool_name.winning_price
        #     self.total_amount=self.invest_amount*self.multi_x
        super().save(*args, **kwargs)
        self.declare_pool()

#==========user address nested data=================
class address_data(models.Model):

    state=models.CharField(max_length=255,blank=True, null=True)
    city = models.CharField(max_length=255,blank=True, null=True)
    country=models.CharField(max_length=255,blank=True, null=True)
    pincode=models.IntegerField(blank=True, null=True)
    def __str__(self) -> str:
        return self.city


#================================
class user_document(models.Model):
    aadhar_card_front=models.FileField(upload_to="user_doc",blank=True,null=True)
    aadhar_card_back=models.FileField(upload_to="user_doc",blank=True,null=True)
    pan_card_front=models.FileField(upload_to="user_doc",blank=True,null=True)
    pan_card_back=models.FileField(upload_to="user_doc",blank=True,null=True)
    # bank_passbook=models.FileField(upload_to="user_doc",blank=True,null=True)
    account_number=models.IntegerField(blank=True,null=True)
    ifsc_code=models.CharField(max_length=100,blank=True,null=True)
    bank_name=models.CharField(max_length=100,blank=True,null=True)
    branch_name=models.CharField(max_length=100,blank=True,null=True)
    state=models.CharField(max_length=100,blank=True,null=True)





#==================Scrach_coupon==========

class Scrach_coupon(models.Model):
    # user_data=models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    image=models.ImageField(upload_to="user_doc", blank=True, null=True)
    coupon_point=models.CharField(max_length=100,blank=True, null=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return self.user_data.name
#================user data======================



class user(models.Model):
    address = models.OneToOneField(address_data, on_delete=models.CASCADE, blank=True, null=True)
    user_doc = models.OneToOneField(user_document, on_delete=models.CASCADE, blank=True, null=True)
    gender=models.CharField(max_length=100,blank=True,null=True)
    dob=models.CharField(max_length=100,blank=True,null=True)

    user_id=models.CharField(max_length=100,blank=True,null=True)
    referred_code=models.CharField(default="",max_length=100)

    name=models.CharField(max_length=100,blank=True,null=True)
    mobile_no=models.IntegerField()
    email=models.EmailField(max_length=100,blank=True,null=True)
    status=models.CharField(default="unblock",blank=True,null=True,max_length=10)
    date_time=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    profile_change_time=models.DateTimeField(auto_now=True,blank=True,null=True)
    image=models.ImageField(upload_to="league_image_media",blank=True,null=True)
    wallet_amount=models.IntegerField(blank=True,null=True)
    winning_amount=models.IntegerField(blank=True,null=True)
    device_token=models.CharField(max_length=50,blank=True,null=True)
    profile_status=models.CharField(max_length=255,default="KYC not submitted",blank=True,null=True)
    rejection_reason=models.TextField(blank=True,null=True)
    referral_by=models.CharField(max_length=10, blank=True, null=True)
    # scrach_list = models.ManyToManyField(Scrach_coupon,blank=True,null=True)
    referral_amount=models.IntegerField(default=0, blank=True, null=True)
    total_deposited_amount=models.FloatField(default=0,blank=True,null=True)
    total_profit_amount=models.FloatField(default=0,blank=True,null=True)
    bonus_amount=models.IntegerField(default=0, blank=True, null=True)
    deposit_amount=models.IntegerField(default=0, blank=True, null=True)
    referral_user_leagth=models.IntegerField(default=0,blank=True,null=True)
    scrach_list=ListTextField(base_field=models.IntegerField(),size=100,blank=True,null=True)
    scratched_coupon_list=ListTextField(base_field=models.IntegerField(),size=100,blank=True,null=True)
    total_withdrawal_amount=models.FloatField(default=0,blank=True,null=True)
    def __str__(self):
        return self.name

class login_user(models.Model):
    email=models.EmailField(max_length=50)
    password=models.CharField(max_length=20)
    admin_type=models.CharField(max_length=100,blank=True,null=True)

    def __str__(self):
        return self.email



#================user_pool_history========

class user_pool_history(models.Model):
    match=models.ForeignKey(Match, on_delete=models.CASCADE, blank=True, null=True)
    pool_name=models.ForeignKey(Add_Pool, on_delete=models.CASCADE, blank=True, null=True)
    user_data=models.ForeignKey(user,on_delete=models.CASCADE, blank=True, null=True)
    pool_type=models.CharField(max_length=20,blank=True, null=True)
    player_pair=models.ManyToManyField(Player, related_name='select_player_pair', blank=True)
    entry_fee=models.IntegerField()
    winning_amount=models.IntegerField()
    date=models.DateTimeField(auto_now_add=True,blank=True, null=True)


#================view_contest_details========
class view_contest_details(models.Model):
    match=models.ForeignKey(Match, on_delete=models.CASCADE, blank=True, null=True)
    pool_name=models.ForeignKey(Add_Pool, on_delete=models.CASCADE, blank=True, null=True)
    user_data=models.ForeignKey(user,on_delete=models.CASCADE, blank=True, null=True)
    player_pair=models.ManyToManyField(Player, null=True, blank=True)
    amount=models.IntegerField()
    refund=models.BooleanField(default=True,blank=True, null=True)






#====================================
class all_match_details(models.Model):
    user_data = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    player = models.ManyToManyField(Player, blank=True, null=True)
    pool_id=models.IntegerField(default=0, blank=True, null=True)
    pool_name = models.ForeignKey(Add_Pool, on_delete=models.CASCADE, blank=True, null=True)
    pool_type = models.CharField(max_length=50, blank=True, null=True)
    match=models.ForeignKey(Match, on_delete=models.CASCADE, blank=True, null=True)
    score=models.FloatField(default=0)
    invest_amount=models.IntegerField()
    multi_x=models.FloatField(blank=True, null=True)
    total_amount=models.IntegerField()

    captain=models.ForeignKey(Player, on_delete=models.CASCADE, blank=True, null=True,related_name='all_match_captain')
    vice_captain=models.ForeignKey(Player, on_delete=models.CASCADE, blank=True, null=True,related_name='all_match_vice_captain')
    match_status = models.CharField(default="upcoming", max_length=50, blank=True, null=True)
    players_score = models.TextField(default='[]',blank=True,null=True)
    winning_status=models.CharField(max_length=50,default="",blank=True,null=True)
    disable_user = models.BooleanField(default=False,blank=True,null=True)


    def __str__(self) -> str:
        return self.user_data.name


#==================payment============
class Add_Amount(models.Model):
    add_amount = models.IntegerField(default=0)
    total_amount = models.FloatField(default=0)


#=============Wallet================
class Wallet(models.Model):
    Player_ID = models.CharField(max_length=500)
    Player_Name = models.CharField(max_length=300)
    total_wallet = models.FloatField(default=0.0)
    total_bonus = models.FloatField(default=0.0)
    add_bonus = models.FloatField(default=0.0)

#=============Wallet_transactions================
class Wallet_transactions(models.Model):

    username = models.CharField(max_length=500)
    mobile_no = models.IntegerField()
    transactions_id = models.CharField(max_length=500)
    mode = models.CharField(max_length=500)
    amount = models.FloatField()
    status = models.CharField(max_length=500)
    credit_debit = models.CharField(max_length=50,blank=True,null=True)
    date_time = models.DateTimeField(auto_now=True)


#===========All_Transcrion==============================
class All_Transcrion(models.Model):
    user_id = models.CharField(max_length=500)
    order_id = models.CharField(max_length=500)
    amount = models.FloatField(max_length=500)
    status = models.CharField(max_length=500)
    credit_debit = models.CharField(max_length=50,blank=True,null=True)
    date_time = models.DateTimeField(auto_now=True)

#==============Withdraw_history========================
class Withdraw_history(models.Model):

    Player_Name = models.CharField(max_length=300)
    Payment_Method = models.CharField(max_length=300)
    Account = models.CharField(max_length=300)
    Amount = models.FloatField(default=0.0)
    Status = models.CharField(max_length=300)
    Action = models.CharField(max_length=300, default="check")


#===================game_amount===================
class game_amount(models.Model):

    username = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    pool = models.ForeignKey(Add_Pool, on_delete=models.CASCADE, blank=True, null=True)
    transactions_id = models.CharField(max_length=500)
    credit_debit = models.CharField(max_length=500)
    amount = models.FloatField()
    status = models.CharField(max_length=500)
    date_time = models.DateTimeField(auto_now_add=True)




#------------------------User_store_team=========

class User_store_team(models.Model):
    user_data = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    player_data = models.ManyToManyField(Player,blank=True, null=True)





class send_otp(models.Model):
    phone_number=models.IntegerField()



class ad(models.Model):
    file=models.FileField(upload_to="video")
    type=models.CharField(max_length=255,blank=True,null=True)


class Ad1(models.Model):
    image_list = ListCharField(
        base_field=models.URLField(max_length=200),
        size=50,
        max_length=(50 * 200) + (50 - 1),
        blank=True,
        null=True,
    )
    index=models.IntegerField(blank=True,null=True)
    remove_index=models.IntegerField(blank=True,null=True)







#======================================
class notification(models.Model):
    user_data = models.ManyToManyField(user, blank=True, null=True)
    message=models.TextField()
    title = models.CharField(max_length=255)
    read = ListTextField(base_field=models.CharField(max_length=100),size=1000,blank=True,null=True)
    timestamp = models.DateTimeField(auto_now_add=True)




#==============================================
class referral(models.Model):
    user_data = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True,related_name='referral_user_data')
    referred_user  = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True,related_name='referral_referred_user')
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)



class Withdraw_amount(models.Model):
    user_data = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    amount_without_tds=models.IntegerField(blank=True, null=True)
    tds=models.IntegerField(blank=True, null=True)
    amount_with_tds=models.IntegerField(blank=True, null=True)
    withdraw_status=models.CharField(default="pending",max_length=255,blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    
    
class user_query(models.Model):
    user_data = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    message=models.TextField(default='[]',blank=True,null=True)
    
    
    
#======================payment============================
class payment(models.Model):
    user_data = models.ForeignKey(user, on_delete=models.CASCADE, blank=True, null=True)
    paid_amount=models.IntegerField(default=0)
    payment_screenshot=models.ImageField(upload_to="user_doc")
    timestamp = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    payment_status=models.CharField(default="pending",max_length=200,blank=True, null=True)
