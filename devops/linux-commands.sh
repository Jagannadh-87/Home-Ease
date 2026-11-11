#!/usr/bin/env bash
# Week 1 – Linux basics demo. Run line by line, or: bash devops/linux-commands.sh
pwd; ls -la                                   # where am I, list files
mkdir -p /tmp/lab/demo && cd /tmp/lab/demo    # create folders
echo "Hello DevOps" > notes.txt                # create file
cat notes.txt; cp notes.txt copy.txt; mv copy.txt renamed.txt   # view / copy / move
chmod 640 notes.txt; ls -l notes.txt           # permissions: owner rw, group r, others none
whoami; id; groups                             # user info
ps aux | head -5; df -h | head -3; free -h     # processes, disk, memory
grep -rn "Hello" .; find . -name "*.txt"       # search
rm -r /tmp/lab                                 # cleanup
