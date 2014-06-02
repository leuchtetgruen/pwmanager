require "test/unit"

class UsernamePasswordExtractionSuite < Test::Unit::TestCase 
	def test_has_username 
		assert(!has_username("foobar"), "PasswordString 'foobar' should not be recognized as including a username")
		assert(has_username("test:foobar"), "PasswordString 'test:foobar' should be recognized as including a username")
		assert(!has_username(""), "EmptyString should not have username")
		assert(!has_username("foobar:"), "A string followed by or started by a colon should not be recognized as having a username")
		assert(!has_username(":foobar"), "A string followed by or started by a colon should not be recognized as having a username")
	end

	def test_extract_username
		s = "test:foobar:d"
		assert_equal(extract_username(s), "test", "Username test could not be extracted from #{s}")
		assert_raise(ArgumentError) { extract_username("test")}
		assert_raise(ArgumentError) { extract_username("test:")}
		assert_raise(ArgumentError) { extract_username(":test")}
	end

	def test_extract_password
		s = "test:foobar:d"
		assert_equal(extract_password(s), "foobar:d", "Password foobar:d could not be extracted from #{s}")
		assert_equal(extract_password("foobar"), "foobar", "Extracting password from a string that only contained a password did not work")
	end
end


class TypeExtensionSuite < Test::Unit::TestCase
	def test_hmap
		h = {"a" => 1, "b" => 2}
		hm = h.hmap { |k,v| { k => v * 2 } }
		assert_equal(hm, {"a" => 2, "b" =>  4 }, "HMap does not work")
	end

	def test_to_hex
		assert_equal("foobar".to_hex , "666f6f626172")
	end
end


class CryptoUtilityMethodsTestSuite < Test::Unit::TestCase
	def test_password_to_key
		assert_equal(password_to_key("foobar").to_hex, "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2")
	end

	def test_create_cipher
		assert_nothing_raised { create_cipher }
		ciph = create_cipher
		assert_equal(ciph.name, "AES-256-CBC", "Created cipher should be AES-256-CBC")
		assert_equal(ciph.iv_len, 16, "Cipher IV should be 16 bytes")
		assert_equal(ciph.key_len, 32, "Cipher Keylen should be 32 bytes")
	end

	def test_encrypt_and_decrypt
		#TODO I think there is some more work to be done here
		s = "foobar"
		pw = "pw"
		iv = create_cipher.random_iv
		enc = encrypt(s, pw, iv)
		dec = decrypt(enc, pw, iv, VERSION, salt_length: DESIRED_SALT_LENGTH)
		assert_equal(dec, s, "Decrypt after encrypt did not work")
	end

	def test_encrypt_and_decrypt_hash
		h = {"a" => "1", "b" => "2" }
		pw = "pw"
		enc_json = encrypt_data(h, pw)
		encH = JSON.parse(enc_json)

		assert(["iv", "description", "cipher", "keygen", "version", "salt_length"].all? { |k| !encH[k].nil? }, "Encrypted hash should contain iv, description, cipher, keygen, version, salt_length")

		decH = read_string(enc_json, pw)
		assert_equal(h, decH)


	end
end


