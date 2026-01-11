# preschool-budget-website
The repository contains simple website for preschool budget

## generating password command
*echo -n "{password}" | sha256sum*

## encrypting file command
*openssl enc -aes-256-cbc -salt -pbkdf2 -in {filename}.json -out {filename}.enc -base64*
