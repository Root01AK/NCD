Username :admin_user
Password: admin123

Username : DEO
Password : DEO


1. In DEO create a proper header, footer non scrollable, where card, location wise completed, total survey, and what are DEO features the old version has add that also, add profile page page.

2. In Survey Management need a enchancement like section wise question we need to build with skip logic and option dropdown, bullet In, add radio button, checkbox, text field, matrix and when a survey is initaild we need to get the user details 

3. Admin panel need separate nav option of participant 


1.	Demographics	Field Supervisor
2.	Medical History	Staff Nurse
3.	Tobacco Use	Staff Nurse
4.	Alcohol Use	Staff Nurse
5.	Other Substance Use	Staff Nurse
6.	Diet and Physical Activity	Staff Nurse
7.	Symptom Screening	Staff Nurse
8.	Mental Health Screening	Staff Nurse or Counselor
9.	Anthropometry	Staff Nurse
10.	Vitals	Staff Nurse
11.	Point-of-Care Tests	Staff Nurse
12.	Clinical Examinations	Doctor
13.	Risk Categorisation and Referral	Doctor
14.	Linkages and Follow-up Tracking	Case Management Coordinator
15.	Health Counseling	Counselor
16.	Community Perception	Filed Supervisor



Once the Field Supervisor completed the Demographics section, in Staff Nurse login it will have a Survey card when and open it will have a dropdown to select the participant id once selecting the id it will have the next section of question that are present in the Staff Nurse part so once the Field Supervisor and Staff Nurse completed the survey in the doctor login it will have a Survey card once opening it will have a dropdown to select the participant id and Case Management Coordinator has access for the Linkages and Follow-up section and Counselor has access for the Mental Health Screening & Health Counseling section and admin we have manay who did what and survey datas are stored in which database and all, and admin also have the access to edit or delete or update


Workflow process Field Supervisor Start the survey where that is when a participant is create which will reflect in admin panel (we will store the entire data their), here the Field Supervisorhas access to Demographics section, here the workflow is once the Field Supervisor initiate the process and complete the Demographics section it will move two the queue in the Staff Nurse portal, where the staff nurse continue the survey from thier from the assigned section of them in the order and it move to the Doctor at section 12 & 13. & Case Management Coordinator section 14 & counselor 15 section and Field Supervisor login and in Queue it will have the participant -id which the Field Supervisor intiated and complete the section 16 this is lifecycle process please let me know if you have any doubts.


cd /Users/kirubakaran/Desktop/NCD/ncd
php -S 127.0.0.1:8080 -t web


In Q9 Code 16 is exclusive. If ticked, no other box may be selected. and in Q9 If code 11 is not ticked, skip to Q11.If Q11 is 2 or 3 skip to Q13, and create a code book for every options, for every options it comes 1,2,3,4,5,6,7,8,9, so on. and in admin panel setup a proper code for every options.

Field Supervisor

UserName : FS001
PassWord : FSadmin123


Staff Nurse

UserName : SN001
PassWord : SNadmin123

Counselor

UserName : C001
PassWord : Cadmin123


Doctor

UserName : D001
PassWord : Dadmin123

Case Management Coordinator

UserName : CMC001
PassWord : CMCadmin123



Assigned Role Privileges & Enabled Survey Modules 10 Sections -- remove the green flicking dots and make it minimal UI. Staff Nurse login can't able to find the dropdown to select the user and start the survey please check it. Do validation fix, here all the field are mandatory without any answer we can't able to move to next question and make it.


The DEO portal is not mobile responsive for the navigation use hamburger menu icon to show the nav options, and footer is sticker fix it. All the rounded UI's is bludge looking fix it, in Mobile view the Grid option UI is not properly aligned. and btn of preview & next is not properly aligned. since it is mysql database add phpadmin in docker as for the XAMPP. and also don't forget it is XAMP hosting application. We have bug sometimes we have issue of creating empty survey.While refreshing creating empty survey screen.

