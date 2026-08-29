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

Phase -1 Correction need to improve

1. Need to Change the Participant code logic need to generate the code location wise sample code is NCDDH0001 for Dharavi, NCDML0001 for Malvani, NCDVA0001 for Vashi.. all should start from 0001 to 9999 possiblities and this code generate should manage or customize by the admin panel, if we add another location also in future. 

2. When hit "Enter" btn the initated Survey automatically closes.

3. Prefill location is not working when we start the survey, if a survey started from the location Dharavi it should automatically choose in the demographics section.. Same like that for Malvani, Vashi..

4. Why Participant select dropdown some in the "Field Supervisor" login when this initate the fresh survey, and it comes for Staff nurse, doctor , counselor, CMC. 

5. In Sync Queue, the participant data comes it all mock data, it is not showing the actual data which entered.

6. Contact Number should be 10 digit and it should have only numbers no alphabets and special characters. Without it we can't able to move to the next question.

7. In admin panel, under the Participant Directory & Multi-Role Audit
when a Field Supervisor initate the survey it will automatically create a participant need to show that create participant id in the participant directory in the admin panel. where need to add views participant response, Location, date of survey, created by Field Supervisor. and need to track the status also one which section the particpant is currently under which user. eg nurse, doctor, counselor, CMC, FS.. and which user completed, in which user queue they are pending. 

Validation Logics

1. If Q11 is opted to code 2 or 3, skip to Q13.
2. If Q14 is opted to code 2 Skip to Q17.
3. If Q17 is opted to code 1 skip and go to Q24 and if opted to code 2 answer Q18 & Q19 the skip to Q24.and if opted to code 3 skip Q18 & Q19 answer the Q20 to Q23 

4. If Q25 is opted code 1 skip to Q33, if opted code 2 answer Q26 then skip to Q33, if opted code 3 skip Q26 and answeer Q27 onwards.
5. Q30 if below threshold, skip to Q33. if positive , administer the full AUDIT (Note: Auto-calculated. Positive is 4 or more for mens, 3 or more for womens and transgender participants)
6. If Q33 is opted code 1 or 5 skip to Q37, if opted code 2 or 3 answer Q34 then skip to Q37, If opted code 4 answer to Q34 to Q36.

7. If Q40 is opted code 2 skip to Q42.
8. If Q43 is opted code 2 skip to Q44.
9. If Q44 is opted code 2 skip to Q46.
10. If Q46 is opted code 2 Skip to Q48.

11. Q58 if opted code 2 or 3, skip to Q60,  Q59 is opted to code 2 or 3, skip to Q61, if both Q58 & Q59 are opted to 0 or 1, skip Q65.
12. Q81 if not opted code 6 skip Q83.
13. Q88 only if BMI at Q69 is below 20. if BMI is 20 or above, skip to Q89
14. Q94 if opted to code 2 skip to section 15.
15. Q97 if opted to code 1, Skip to Q107 and close the remaining attempts.otherwise procceed to attempt 2.
16. Q103 if opted code 1 go to Q107. ANy other outcome closes the record as lost to follow-up and make Q104 compulsory.No fourth attempt is permitted and no date may be extended.

Q27-Q29 are smilar to Q21-Q23, however the formatting is not the same way, we understand that the total score capturing to be there, please check so that we can make chnages to same accordingly

Compulsory safety validation. The form cannot be submitted where PHQ-9 item 9 (Q64) is positive and the escalation field (Q65) is blank.
Range checks at entry. Apply plausibility ranges to every numeric field, in particular waist-hip ratio (0.60 to 1.40), BMI (10 to 60), systolic BP (70 to 260), diastolic BP (40 to 160), RBS (30 to 600) and haemoglobin (3 to 20). Reject out-of-range values at entry, not at analysis.
Auto-calculated fields. BMI, waist-hip ratio, average blood pressure, Heaviness of Smoking Index, AUDIT-C total and the Amber review date are calculated, not typed.



Production Creds

Counselor
Couns
Co001

Field Supervisor
FS
Fs001

Staff Nurse
SN1
Sf001


Admin
admin_user
admin123



If Input is 1222 - 4 digit for Q1. Age: * (Need to though the error)
Q23. Heaviness of Smoking Index total (Q21 + Q22): 
       / 6
Auto-calculated. A score of 4 or more indicates high dependence and routes to cessation counselling at Q111.
Section 4 · Alcohol use (AUDIT-C, with full AUDIT on a positive screen)
Q11 Logic is not working
Q14 Logic not working
Q17 two logic is workign fine but the if opted to code 3 skip Q18 & Q19 answer the Q20 and follow
Q25 choice 1 logic work but other two not working
Q33 logic issue
Q40 
Q42
Q44
Q46
Q58
Q59
Q65
Q81
Q86


When click the "Create User" btn it show the modal of user previlages to creating but it all select need to a fresh not selecting stuff. While login we have toggle switch concept for login to admin & DEO right, In DEO login UI section we need a dropdown menu to select the location and login. 