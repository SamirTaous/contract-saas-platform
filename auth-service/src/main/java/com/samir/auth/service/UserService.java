package com.samir.auth.service;

import org.springframework.stereotype.Service;

import java.util.List;

public interface UserService {
    public List getAllUsers();
    public Object getUser();
}
